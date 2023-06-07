import { ApolloError } from "apollo-server-express";
import { config } from "config";
import {
    courseRoles,
    fallbackLanguage,
    Permission,
    RoleType,
    ServerError,
    SortingOrder,
} from "core";
import { differenceInYears } from "date-fns";
import { DBAssignment } from "db/Assignment";
import { DBCourse, ICourse } from "db/Course";
import { DBInvitation } from "db/Invitation";
import { DBModule } from "db/Module";
import { DBRole } from "db/Role";
import { DBSubmission } from "db/Submission";
import { DBUser, IUser } from "db/User";
import { Course } from "graphql/course/Course";
import { User } from "graphql/user/User";
import { log } from "Logger";
import { sendEmail } from "Mail";
import { isInOrganization } from "operations/User.operation";
import { RequestContext } from "RequestContext";
import {
    Arg,
    Args,
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
import { CourseUserSearchArgs } from "./CourseUserSearch.args";
import { CourseUserSearchResult } from "./CourseUserSearch.result";
import { UserCreateInput } from "./UserCreate.input";

const opt = { nullable: true };

export function regexEscape(input: string): string {
    return input.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

@Resolver(Course)
export class CourseUsersResolver {
    @Authorized()
    @Query((returns) => CourseUserSearchResult)
    public async searchCourseUsers(
        @Ctx() context: RequestContext,
        @Args() args: CourseUserSearchArgs
    ) {
        const {
            pageSize = 100,
            page = 1,
            roles,
            orderBy = "lastName",
            order = SortingOrder.asc,
            term,
        } = args;
        let courseId = args.courseId;

        const organizationId = context.organization?._id;

        if (page <= 0) {
            throw new ApolloError(
                `Expected positive page number, received ${page}.`
            );
        }

        if (!courseId && !context.can(Permission.readAnyCourseUser)) {
            throw new UnauthorizedError();
        }
        if (courseId) {
            const course = await context.loadById(DBCourse, courseId);
            if (!context.can(Permission.readCourseUser, course)) {
                throw new UnauthorizedError();
            }
            courseId = course?.id;
        }

        // initial query object with the organization id
        const query: any = {
            organizations: organizationId,
        };

        // retrieve the roles
        const roleQuery: any = {
            organizationId,
            subjectId: courseId,
            active: true,
        };
        if (roles) {
            roleQuery.role = { $in: roles };
        }
        const courseRoles = await DBRole.find(roleQuery);
        context.prime(DBRole, courseRoles);

        // filter by roles in the course
        query._id = { $in: courseRoles.map((r) => r.userId) };

        // match search string
        if (term) {
            const _term = regexEscape(term);
            query.$or = [
                {
                    firstName: { $regex: _term, $options: "gi" },
                },
                {
                    lastName: { $regex: _term, $options: "gi" },
                },
                {
                    emailAddress: { $regex: _term, $options: "gi" },
                },
            ];
        }

        const allowedFields = ["firstName", "lastName", "emailAddress"];
        if (allowedFields.indexOf(orderBy) < 0) {
            throw new ApolloError(
                `Unknown order by field name: ${orderBy}. Expected: ${allowedFields}.`
            );
        }

        // do a count of the total
        const total = await DBUser.countDocuments(query);

        const users = await DBUser.find(query, undefined, {
            skip: (pageSize || 0) * (page - 1),
            limit: pageSize,
        })
            .sort({ [orderBy]: order })
            .collation({ locale: "en", alternate: "shifted" });
        context.prime(DBUser, users);

        return {
            users,
            total,
        };
    }

    @Authorized()
    @Mutation((returns) => Course)
    public async addCourseUsers(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("users", (type) => [UserCreateInput])
        users: UserCreateInput[],
        @Arg("role", (type) => RoleType, opt)
        role: RoleType = RoleType.courseStudent
    ) {
        // retrieve the course
        const course = await context.loadById(DBCourse, id);
        if (!course) {
            throw new ApolloError(
                `Course with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        // check that the course is an organization course
        if (!course.organizationId || !context.organization) {
            throw new UnauthorizedError();
        }

        const organization = context.organization;

        // Check that an organization exists
        if (!organization) {
            throw new UnauthorizedError();
        }

        // check that the logged in user is allowed to change the course users
        if (
            !context.can(Permission.updateCourseUser, course) ||
            course.archived
        ) {
            throw new UnauthorizedError();
        }

        // verify that the specified role is a course role
        if (courseRoles.indexOf(role) < 0) {
            throw new UnauthorizedError();
        }

        // check that any existing users not already have a role in this course
        let existingUsers = await DBUser.find({
            emailAddress: { $in: users.map((u) => u.emailAddress) },
        });
        let existingUserEmailAddresses = existingUsers.map(
            (u) => u.emailAddress
        );

        let userEmailAdressesWithExistingRoles: any[] = [];
        for (const existingUser of existingUsers) {
            const existingRole = await DBRole.findOne({
                organizationId: course.organizationId,
                userId: existingUser._id,
                subjectId: id,
            });
            if (existingRole) {
                userEmailAdressesWithExistingRoles.push(
                    existingUser.emailAddress
                );
            }
        }

        // Remove users that already have a role in this course
        existingUsers = existingUsers.filter(
            (user) =>
                userEmailAdressesWithExistingRoles.indexOf(user.emailAddress) <
                0
        );

        existingUserEmailAddresses = existingUserEmailAddresses.filter(
            (email) => userEmailAdressesWithExistingRoles.indexOf(email) < 0
        );

        // Verify that if we are adding course admins, all of those users are teachers/admins
        if (role === RoleType.courseAdmin) {
            const roleCount = await DBRole.countDocuments({
                organizationId: course.organizationId,
                userId: { $in: existingUsers.map((u) => u._id) },
                role: {
                    $in: [
                        RoleType.organizationAdmin,
                        RoleType.organizationStaff,
                    ],
                },
            });
            if (roleCount !== users.length) {
                throw new ApolloError(
                    `Only organization admins or staff members can be administrator of a course. Please upgrade users to staff, or add them to your organization first.`,
                    ServerError.UsersCannotBeCourseAdmins
                );
            }
        }

        // If an existing user is not part of the organization, add them to the organization
        for (const user of existingUsers) {
            if (isInOrganization(user, course.organizationId)) {
                continue;
            }

            // add the user to the organization
            user.organizations = user.organizations || [];
            user.organizations.push(course.organizationId);
            await user.save();

            // create the organization role
            await DBRole.create({
                organizationId: course.organizationId,
                role:
                    role === RoleType.courseStudent
                        ? RoleType.organizationStudent
                        : RoleType.organizationOther,
                subjectId: course.organizationId,
                userId: user._id,
                active: true,
            });
        }

        log.debug(
            `Find and/or create new users before enrolling them into course ${course.id}.`
        );

        const newUsersToBeCreated = users.filter(
            (u) =>
                userEmailAdressesWithExistingRoles.indexOf(u.emailAddress) < 0
        );

        // find the users and create new users if (s)he doesn't exist yet
        const newUsers = await DBUser.insertMany(
            newUsersToBeCreated
                .filter(
                    (user) =>
                        existingUserEmailAddresses.indexOf(user.emailAddress) <
                        0
                )
                .map((user) => ({
                    organizations: [course.organizationId],
                    language: context.user?.language || fallbackLanguage,
                    teacher: role !== RoleType.courseStudent,
                    ...user,
                }))
        );

        // create the corresponding organization role
        log.debug(`Creating organization role for new users.`);

        await DBRole.insertMany(
            newUsers.map((user) => ({
                organizationId: course.organizationId,
                role:
                    role === RoleType.courseStudent
                        ? RoleType.organizationStudent
                        : RoleType.organizationOther,
                subjectId: course.organizationId,
                userId: user._id,
                active: true,
            }))
        );

        const allUserDocs = existingUsers.concat(newUsers);

        // create the course roles and invitations
        await Promise.all(
            allUserDocs.map(async (user) => {
                const newRole = await DBRole.create({
                    organizationId: course.organizationId,
                    subjectId: id,
                    role,
                    userId: user._id,
                    active: false,
                });

                await DBInvitation.create({
                    userId: user._id,
                    organizationId: course.organizationId,
                    inviterId: context.user?._id,
                    roleId: newRole._id,
                });

                const inviter = `${context.user?.firstName} ${context.user?.lastName}`;
                const language = context.user?.language
                    ? context.user.language.split("-")[0]
                    : fallbackLanguage;

                const hasSSO =
                    organization.ssoProvider &&
                    organization.emailDomainNames?.includes(
                        user?.emailAddress.split("@")[1]
                    );

                const inviteMailData = {
                    personalizations: [
                        {
                            to: [
                                {
                                    email: user.emailAddress,
                                },
                            ],
                            dynamic_template_data: {
                                courseName: course.title!,
                                inviter,
                                link:
                                    !!hasSSO ||
                                    (!!user?.firstName && !!user?.lastName)
                                        ? `${context.domain}/auth/login?emailAddress=${user.emailAddress}`
                                        : `${context.domain}/auth/register?emailAddress=${user.emailAddress}`,
                            },
                        },
                    ],
                    reply_to: {
                        name: inviter,
                        email: context.user!.emailAddress,
                    },
                    template_id:
                        config.sendgrid.templates.courseInvite[language],
                };

                log.debug(
                    `Sending out course invite notification emails to new users.`,
                    inviteMailData
                );

                const result = await sendEmail(inviteMailData);

                log.debug(`Course invite notification emails sent.`, result);
            })
        );

        // update the used student credits in the organization
        if (role === RoleType.courseStudent) {
            organization.licenseUsedStudentCredits =
                organization.licenseUsedStudentCredits || 0;
            organization.licenseUsedStudentCredits += users.length;
            await organization.save();
        }

        if (newUsersToBeCreated.length > 0) {
            log.debug(
                `Creating ${newUsersToBeCreated.length} users in course ${course.id}.`
            );

            log.notice(
                `Added ${newUsersToBeCreated.length} users to course "${course.title}" (${course.id}).`,
                newUsersToBeCreated
            );
        } else {
            log.debug("No new users to be created.");
        }

        // return the course
        return course;
    }

    @Authorized()
    @Mutation((returns) => Course)
    public async removeCourseUsers(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("users", (type) => [ID])
        users: string[]
    ) {
        const organization = context.organization;

        // Check that this is a Pro account
        if (!organization) {
            throw new UnauthorizedError();
        }

        // retrieve the course, modules, and assignments
        const course = await context.loadById(DBCourse, id);
        if (!course) {
            throw new ApolloError(
                `Course with id ${id} not found.`,
                ServerError.NotFound
            );
        }
        const modules = await DBModule.find({
            courseId: course._id,
        });
        const assignments = await DBAssignment.find(
            {
                moduleId: { $in: modules.map((module) => module._id) },
            },
            "_id"
        );

        // check that the logged in user is allowed to change the course
        if (
            !context.can(Permission.updateCourseUser, course) ||
            course.archived
        ) {
            throw new UnauthorizedError();
        }

        // verify that there will still be an admin
        if (
            !(await DBRole.countDocuments({
                organizationId: course.organizationId,
                subjectId: id,
                role: RoleType.courseAdmin,
                userId: { $nin: users },
                active: true,
            }))
        ) {
            throw new ApolloError(
                `A course should have at least one admin.`,
                ServerError.AtLeastOneAdminError
            );
        }

        log.debug(
            `Deleting user role(s) from course "${course.title}" (${course.id}).`,
            users
        );

        let creditReimburseCount = 0;
        // count how many of the deleted users were not active in the course
        for (const user of users) {
            // if there is no license renewal, don't reimburse
            if (!organization.licenseRenewalDate) {
                continue;
            }
            // count the number of submissions by this user
            const submissionCount = await DBSubmission.countDocuments({
                organizationId: course.organizationId,
                assignmentId: {
                    $in: assignments.map((assignment) => assignment._id),
                },
                userId: user,
            });
            // if there were submissions, don't reimburse the user
            if (submissionCount > 0) {
                continue;
            }
            // find the course role for the user
            const role = await DBRole.findOne({
                organizationId: course.organizationId,
                subjectId: id,
                userId: user,
            });
            if (!role) {
                continue;
            }
            // if the role was created less than a year before the renewal date,
            // reimburse the credit
            if (
                differenceInYears(
                    organization.licenseRenewalDate,
                    role.createdAt
                ) < 1
            ) {
                creditReimburseCount += 1;
            }
        }

        // retrieve the roles
        const roles = await DBRole.find({
            organizationId: course.organizationId,
            subjectId: id,
            userId: { $in: users },
        });

        // delete any invitations associated with the roles
        await DBInvitation.deleteMany({
            roleId: { $in: roles.map((r) => r._id) },
        });

        // delete the roles
        await DBRole.deleteMany({
            organizationId: course.organizationId,
            subjectId: id,
            userId: { $in: users },
        });

        log.debug(
            `Deleting student submissions from course "${course.title}" (${course.id}).`,
            users
        );

        // delete any associated assignment submissions
        await DBSubmission.deleteMany({
            organizationId: course.organizationId,
            assignmentId: {
                $in: assignments.map((assignment) => assignment._id),
            },
            userId: { $in: users },
        });

        log.notice(
            `Removed ${users.length} users from course "${course.title}" (${course.id}).`,
            users
        );

        // reimburse credits if needed
        if (creditReimburseCount > 0) {
            organization.licenseUsedStudentCredits =
                organization.licenseUsedStudentCredits || 0;
            organization.licenseUsedStudentCredits -= creditReimburseCount;
            await organization.save();
        }

        // return the course
        return course;
    }

    @Authorized()
    @Mutation((returns) => Course)
    public async editCourseUserRole(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("userId", (type) => ID) userId: string,
        @Arg("role", (type) => RoleType)
        role: RoleType
    ) {
        // Check that this is a Pro license
        if (!context.organization) {
            throw new UnauthorizedError();
        }

        // retrieve the course
        const course = await context.loadById(DBCourse, id);
        if (!course) {
            throw new ApolloError(
                `Course with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        // check that the logged in user is allowed to change the course
        if (
            !context.can(Permission.updateCourseUser, course) ||
            course.archived
        ) {
            throw new UnauthorizedError();
        }

        // retrieve the role
        const roleDoc = await DBRole.findOne({
            organizationId: course.organizationId,
            subjectId: id,
            userId,
            active: true,
        });

        if (!roleDoc) {
            throw new ApolloError(
                `Role for user ${userId} in course ${course.id} not found.`,
                ServerError.NotFound
            );
        }

        // verify that the role is not a student (student roles may not be changed)
        if (roleDoc.role === RoleType.courseStudent) {
            throw new UnauthorizedError();
        }

        // Verify that if we are adding a course admins, the user is a teacher or admin
        if (role === RoleType.courseAdmin) {
            const organizationRole = await DBRole.findOne({
                organizationId: course.organizationId,
                userId,
                subjectId: course.organizationId,
                active: true,
            });
            if (
                !organizationRole?.role ||
                [
                    RoleType.organizationAdmin,
                    RoleType.organizationStaff,
                ].indexOf(organizationRole?.role) === -1
            ) {
                throw new ApolloError(
                    `Only organization admins or staff members can be administrator of a course. Please upgrade user to staff, or add to your organization first.`,
                    ServerError.UsersCannotBeCourseAdmins
                );
            }
        }

        if (
            roleDoc.role === RoleType.courseAdmin &&
            role !== RoleType.courseAdmin
        ) {
            // we are removing an administrator, so count the number of existing administrators
            const nrAdmins = await DBRole.countDocuments({
                organizationId: course.organizationId,
                subjectId: id,
                role: RoleType.courseAdmin,
                active: true,
            });
            if (nrAdmins < 2) {
                throw new ApolloError(
                    `A course should have at least one admin.`,
                    ServerError.AtLeastOneAdminError
                );
            }
        }

        log.info(
            `Updating course role for user ${userId} for course ${course.title} (${course.id}) from ${roleDoc.role} to ${role}.`
        );

        roleDoc.role = role;
        await roleDoc.save();

        // return the course
        return course;
    }

    @FieldResolver((type) => [User], opt)
    public async staff(
        @Root() root: ICourse,
        @Ctx() context: RequestContext
    ): Promise<IUser[]> {
        // check for permissions
        if (!context.can(Permission.readCourseUser, root)) {
            return [];
        } else {
            // find the roles
            const roles = await DBRole.find({
                subjectId: root._id,
                role: { $ne: RoleType.courseStudent },
            });

            // retrieve the corresponding users
            return DBUser.find({
                _id: { $in: roles.map((role) => role.userId) },
            });
        }
    }

    @FieldResolver((type) => [User])
    public async students(
        @Root() root: ICourse,
        @Ctx() context: RequestContext
    ): Promise<IUser[]> {
        if (!context.can(Permission.readCourseUser, root)) {
            return [];
        }

        const roles = await DBRole.find({
            subjectId: root?.id,
            role: RoleType.courseStudent,
        });

        return DBUser.find({ _id: { $in: roles.map((r) => r.userId) } });
    }

    @FieldResolver((type) => Number, opt)
    public async studentCount(
        @Root() root: ICourse,
        @Ctx() context: RequestContext
    ) {
        if (!context.can(Permission.readCourseUser, root)) {
            return null;
        }

        return (await this.students(root, context)).length || 0;
    }
}
