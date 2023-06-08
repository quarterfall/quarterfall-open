import { ApolloError } from "apollo-server-express";
import { config, environment } from "config";
import {
    courseRoles,
    fallbackLanguage,
    generateId,
    Permission,
    RoleType,
    ServerError,
} from "core";
import { DBAssignment } from "db/Assignment";
import { DBCourse } from "db/Course";
import { DBInvitation } from "db/Invitation";
import { DBModule } from "db/Module";
import { DBOrganization } from "db/Organization";
import { DBRole } from "db/Role";
import { DBSubmission } from "db/Submission";
import { DBUser, IUser } from "db/User";
import { Course } from "graphql/course/Course";
import { Invitation } from "graphql/invitation/Invitation";
import { Submission } from "graphql/submission/Submission";
import { log } from "Logger";
import { moduleCompleted } from "operations/Module.operation";
import { isInOrganization } from "operations/User.operation";
import {
    Arg,
    Authorized,
    Ctx,
    FieldResolver,
    ID,
    Mutation,
    Query,
    Resolver,
    Root,
    UnauthorizedError,
} from "type-graphql";
import { sendEmail, updateContact } from "../../Mail";
import { RequestContext } from "../../RequestContext";
import { createAuthToken, exchangeAuthToken } from "../../Security";
import { Organization } from "../organization/Organization";
import { User } from "./User";
import { UserUpdateInput } from "./UserUpdate.input";

const opt = { nullable: true };

@Resolver(User)
export class UserResolver {
    //
    // Queries
    //

    @Query()
    public loggedIn(@Ctx() context: RequestContext): boolean {
        return !!context.user;
    }

    @Query((returns) => User, { nullable: true })
    public async me(@Ctx() context: RequestContext): Promise<IUser | null> {
        return context.user || null;
    }

    //
    // Mutations
    //

    @Authorized()
    @Mutation((returns) => User)
    public async updateMe(
        @Arg("input") input: UserUpdateInput,
        @Ctx() context: RequestContext
    ): Promise<IUser> {
        return this.updateUser(context.user?.id, input, context);
    }

    @Authorized()
    @Mutation((returns) => User)
    public async updateUser(
        @Arg("id", (type) => ID) id: string,
        @Arg("input") input: UserUpdateInput,
        @Ctx() context: RequestContext
    ): Promise<IUser> {
        // retrieve the user
        const user = await context.loader(DBUser).load(id);
        if (!user) {
            throw new ApolloError(
                `User with id ${id} not found.`,
                ServerError.NotFound
            );
        }
        if (context.organization) {
            // verify that the organizations match if we're in an organization
            if (!isInOrganization(user, context.organization?._id)) {
                throw new UnauthorizedError();
            }

            // check that the logged in user is allowed to change user information
            if (
                !context.can(Permission.updateOrganizationUser) &&
                !context.user?._id.equals(user._id)
            ) {
                throw new UnauthorizedError();
            }
        }

        if (input.organizationRole) {
            // check that the logged in user is allowed to update the organization
            if (!context.can(Permission.updateOrganization)) {
                throw new UnauthorizedError();
            }

            // retrieve the role
            const roleDoc = await DBRole.findOne({
                organizationId: context.organization?.id,
                subjectId: context.organization?.id,
                userId: user?.id,
                active: true,
            });

            if (!roleDoc) {
                throw new ApolloError(
                    `Role for user ${user?.id} in organization ${context.organization?.id} not found.`,
                    ServerError.NotFound
                );
            }

            if (
                roleDoc.role === RoleType.organizationAdmin &&
                input.organizationRole !== RoleType.organizationAdmin
            ) {
                // we are removing an administrator, so count the number of existing administrators
                const nrAdmins = await DBRole.countDocuments({
                    organizationId: context.organization?.id,
                    subjectId: context.organization?.id,
                    role: RoleType.organizationAdmin,
                    active: true,
                });
                if (nrAdmins < 2) {
                    throw new ApolloError(
                        `An organization should have at least one admin.`,
                        ServerError.AtLeastOneAdminError
                    );
                }
            }

            log.info(
                `Updating organization role for user ${user?.id} for organization ${context.organization?.name} (${context.organization?.id}) from ${roleDoc.role} to ${input.organizationRole}.`
            );

            roleDoc.role = input.organizationRole;
            await roleDoc.save();
        }

        log.notice(
            `Updating user ${user?.firstName} ${user?.lastName} (${user?.id}).`,
            input
        );

        user.set(input);
        await user.save();

        // find the sendgrid user and update if necessary
        if (environment === "production") {
            updateContact(user.emailAddress, input);
        }

        return user;
    }

    @Authorized()
    @Mutation((returns) => Boolean)
    public async requestChangeEmailAddress(
        @Arg("emailAddress") emailAddress: string,
        @Ctx() context: RequestContext
    ): Promise<boolean> {
        const user = context.user!;
        // Check if the email address already exists
        if (
            (await DBUser.countDocuments({
                emailAddress: emailAddress.toLowerCase(),
            })) > 0
        ) {
            throw new ApolloError(
                "Email address already exists in the database.",
                ServerError.EmailAddressAlreadyExists
            );
        }

        // generate an auth token containing the new email address
        const salt = generateId({ length: 256 });
        const token = createAuthToken(
            user._id.toHexString(),
            config.auth.magicLinkLifetime,
            config.auth.secret,
            {
                salt,
                emailAddress,
            }
        );
        const magicLink = `${context.domain}/auth/change-email/${token}`;

        // store the link in the user
        user.salts = user.salts || [];
        user.salts.push(salt);
        await user.save();

        // Retrieve the language to use for sending the email
        const language = user.language
            ? user.language.split("-")[0]
            : fallbackLanguage;

        const mailData = {
            personalizations: [
                {
                    to: [{ email: emailAddress }],
                    dynamic_template_data: {
                        link: magicLink,
                        oldEmail: user.emailAddress,
                        newEmail: emailAddress,
                    },
                },
            ],
            template_id: config.sendgrid.templates.changeEmailRequest[language],
        };

        log.debug(`Sending email address reset email.`, mailData);

        const result = await sendEmail(mailData);

        log.notice(
            `Sent email address reset to user ${user.firstName} ${user.lastName} (${user.id}).`,
            result
        );

        return true;
    }

    @Mutation((returns) => Boolean)
    public async completeChangeEmailAddress(
        @Ctx() context: RequestContext,
        @Arg("token") token: string
    ): Promise<boolean> {
        // retrieve the user id from the token
        const payload = exchangeAuthToken<{
            salt: string;
            userId: string;
            emailAddress: string;
        }>(config.auth.secret, token);
        if (!payload?.userId || !payload?.emailAddress) {
            throw new UnauthorizedError();
        }

        // retrieve the user
        const user = await context.loadById(DBUser, payload.userId);
        if (!user) {
            throw new UnauthorizedError();
        }

        // verify that the salt is in the user's salt list
        if ((user.salts || []).indexOf(payload.salt || "") < 0) {
            throw new UnauthorizedError();
        }

        // store the old email address for the verification mail
        const oldEmailAddress = user.emailAddress;

        // update the user's email address
        user.emailAddress = payload.emailAddress;

        // clear the salt list
        user.salts = [];
        await user.save();

        // Retrieve the language to use for sending the email
        const language = user.language
            ? user.language.split("-")[0]
            : fallbackLanguage;

        const mailData = {
            personalizations: [
                {
                    to: [
                        { email: oldEmailAddress },
                        { email: user.emailAddress },
                    ],
                    dynamic_template_data: {
                        oldEmail: oldEmailAddress,
                        newEmail: user.emailAddress,
                    },
                },
            ],
            template_id:
                config.sendgrid.templates.changeEmailVerification[language],
        };

        log.debug(`Sending email address reset confirmation email.`, mailData);

        const result = await sendEmail(mailData);

        log.notice(
            `Sent email address reset confirmation email to user ${user.firstName} ${user.lastName} (${user.id}).`,
            result
        );

        return true;
    }

    //
    // Fields
    //

    @FieldResolver((type) => Boolean)
    public isSysAdmin(@Ctx() context: RequestContext) {
        return context.isSysAdmin;
    }

    @FieldResolver((type) => String)
    public name(@Root() user: IUser) {
        if (!user.firstName && !user.lastName) {
            return user.emailAddress;
        } else {
            return user.firstName + " " + user.lastName;
        }
    }

    @FieldResolver((type) => String)
    public avatarName(@Root() user: IUser) {
        if (user.firstName && user.lastName) {
            return (user.firstName[0] + user.lastName[0]).toUpperCase();
        } else {
            return user.emailAddress.substring(0, 2).toUpperCase();
        }
    }

    // finds all the courses this user has a role
    @FieldResolver((type) => [Course])
    public async courses(@Root() user: IUser, @Ctx() context: RequestContext) {
        // first, find all the roles related to a course
        const roles = await DBRole.find({
            organizationId: context.organization?._id,
            userId: user.id,
            role: { $in: courseRoles },
            active: true,
        });
        context.prime(DBRole, roles);

        const courses = await DBCourse.find({
            _id: { $in: roles.map((role) => role.subjectId) },
            organizationId: context.organization?._id,
        })
            .sort("title")
            .collation({ locale: "en", alternate: "shifted" });
        context.prime(DBCourse, courses);

        return courses;
    }

    @FieldResolver((type) => [Invitation])
    public async invitations(
        @Root() user: IUser,
        @Ctx() context: RequestContext
    ) {
        return DBInvitation.find({
            userId: user._id,
            organizationId: context.organization?._id,
        });
    }

    @FieldResolver((type) => Organization, opt)
    public async organization(
        @Root() user: IUser,
        @Ctx() context: RequestContext
    ) {
        return context.organization;
    }

    @FieldResolver((type) => [Organization])
    public async organizations(
        @Root() user: IUser,
        @Ctx() context: RequestContext
    ) {
        // you can always access the organizations belonging to the user of the same email address
        // this allows us to add switching later on (or in development)
        const proUser = await DBUser.findOne({
            emailAddress: user.emailAddress,
        });
        return DBOrganization.find({
            _id: { $in: proUser?.organizations || [] },
        });
    }

    @FieldResolver((type) => RoleType, opt)
    public async courseRole(
        @Ctx() context: RequestContext,
        @Root() user: IUser,
        @Arg("courseId", (type) => ID) courseId: string
    ) {
        const role = await DBRole.findOne({
            organizationId: context.organization?._id,
            subjectId: courseId,
            userId: user._id,
            active: true,
        });
        return role?.role;
    }

    @FieldResolver((type) => Boolean, opt)
    public async isActive(
        @Ctx() context: RequestContext,
        @Root() user: IUser,
        @Arg("courseId", (type) => ID) courseId: string
    ) {
        return Boolean(await this.courseRole(context, user, courseId));
    }

    @FieldResolver((type) => RoleType, opt)
    public async organizationRole(
        @Ctx() context: RequestContext,
        @Root() user: IUser
    ) {
        const role = await DBRole.findOne({
            organizationId: context.organization?._id,
            subjectId: context.organization?._id,
            userId: user._id,
            active: true,
        });
        return role?.role;
    }

    @FieldResolver((type) => Boolean)
    public async isStudent(
        @Ctx() context: RequestContext,
        @Root() user: IUser
    ) {
        const role = await DBRole.findOne({
            organizationId: context.organization?._id,
            subjectId: context.organization?._id,
            userId: user._id,
            active: true,
        });
        return role?.role === RoleType.organizationStudent;
    }

    @FieldResolver((type) => [Submission], opt)
    public async submissions(
        @Ctx() context: RequestContext,
        @Root() user: IUser
    ) {
        if (!context.user!._id.equals(user._id)) {
            throw new UnauthorizedError();
        }
        const subs = await DBSubmission.find({
            userId: user?.id,
            submittedDate: { $exists: true },
        })
            .sort({
                updatedAt: "desc",
            })
            .limit(100);
        return subs;
    }

    @Authorized()
    @FieldResolver((type) => Number)
    public async completedModuleCount(
        @Ctx() context: RequestContext,
        @Root() user: IUser,
        @Arg("courseId", (type) => ID) courseId: string
    ) {
        // find the course
        const course = await context.loadById(DBCourse, courseId);

        // verify that the user is allowed to see the completed module count
        if (
            !context.can(Permission.readSubmission, course) &&
            !context.user!._id.equals(user._id)
        ) {
            throw new UnauthorizedError();
        }
        // find the visible modules
        const modules = await DBModule.find({
            courseId,
            visible: { $ne: false },
        });
        context.prime(DBModule, modules);

        // ignore empty modules
        const assignmentCounts = await Promise.all(
            modules.map((m) => DBAssignment.countDocuments({ moduleId: m._id }))
        );
        const modulesWithAssignments = modules.filter(
            (_, index) => assignmentCounts[index]
        );

        // return the number of completed modules
        return (
            await Promise.all(
                modulesWithAssignments.map((module) =>
                    moduleCompleted(module._id, user._id)
                )
            )
        ).filter((v) => v === true).length;
    }
}
