import { ApolloError } from "apollo-server-express";
import { config } from "config";
import {
    fallbackLanguage,
    Permission,
    RoleType,
    ServerError,
    SortingOrder,
} from "core";
import { DBOrganization } from "db/Organization";
import { DBRole } from "db/Role";
import { DBUser } from "db/User";
import { UserCreateInput } from "graphql/course/UserCreate.input";
import { log } from "Logger";
import {
    deleteUsersFromOrganization,
    isInOrganization,
} from "operations/User.operation";
import { RequestContext } from "RequestContext";
import {
    Arg,
    Args,
    Authorized,
    Ctx,
    ID,
    Mutation,
    Query,
    Resolver,
    UnauthorizedError,
} from "type-graphql";
import { sendEmail } from "../../Mail";
import { Organization } from "./Organization";
import { OrganizationUserSearchArgs } from "./OrganizationUserSearch.args";
import { OrganizationUserSearchResult } from "./OrganizationUserSearch.result";

const opt = { nullable: true };

export function regexEscape(input: string): string {
    return input.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

@Resolver(Organization)
export class OrganizationUsersResolver {
    @Authorized()
    @Query((returns) => OrganizationUserSearchResult)
    public async searchOrganizationUsers(
        @Args() args: OrganizationUserSearchArgs,
        @Ctx() context: RequestContext
    ) {
        const {
            pageSize = 100,
            page = 1,
            id,
            roles,
            orderBy = "lastName",
            order = SortingOrder.asc,
            term,
        } = args;

        // if supplying a different id, check that the user is a sys admin
        if (id && id !== context.organization?.id && !context.isSysAdmin) {
            throw new UnauthorizedError();
        }
        if (id && id !== context.organization?.id) {
            if (!context.isSysAdmin) {
                throw new UnauthorizedError();
            }
            // find the organization and store it in the context
            const organization = await DBOrganization.findById(id);
            if (!organization) {
                throw new UnauthorizedError();
            }
            context.organization = organization;
        }

        const organizationId = id || context.organization?._id;

        if (!context.can(Permission.readOrganizationUser)) {
            throw new UnauthorizedError();
        }

        if (page <= 0) {
            throw new ApolloError(
                `Expected positive page number, received ${page}.`
            );
        }

        // initial query object with the organization id
        const query: any = {
            organizations: organizationId,
        };

        // retrieve the roles
        const roleQuery: any = {
            organizationId,
            subjectId: organizationId,
            active: true,
        };
        if (roles) {
            roleQuery.role = { $in: roles };
        }
        const organizationRoles = await DBRole.find(roleQuery);

        // filter by roles in the organization
        query._id = { $in: organizationRoles.map((r) => r.userId) };

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

        return {
            users,
            total,
        };
    }

    @Authorized()
    @Mutation((returns) => Organization)
    public async addOrganizationUsers(
        @Arg("users", (type) => [UserCreateInput])
        users: UserCreateInput[],
        @Arg("role", (type) => RoleType, opt)
        role: RoleType = RoleType.organizationStaff,
        @Ctx() context: RequestContext
    ) {
        const organization = context.organization;

        // check that the logged in user is allowed to update the organization users
        if (!organization || !context.can(Permission.updateOrganizationUser)) {
            throw new UnauthorizedError();
        }

        const existingUsers = await DBUser.find({
            emailAddress: { $in: users.map((u) => u.emailAddress) },
        });
        const existingUserEmailAddresses = existingUsers.map(
            (u) => u.emailAddress
        );

        // if an existing user is not part of the organization, add them to the organization
        for (const user of existingUsers) {
            if (isInOrganization(user, organization._id)) {
                continue;
            }
            // add user to organization
            user.organizations = user.organizations || [];
            user.organizations.push(organization._id);
            await user.save();

            // create a user role
            await DBRole.create({
                organizationId: organization._id,
                subjectId: organization._id,
                role,
                userId: user.id,
                active: true,
            });
        }

        log.debug(
            `Creating new users for organization ${context.organization?.name} (${context.organization?.id}).`
        );

        // create new users
        const userDocs = await DBUser.insertMany(
            users
                .filter(
                    (u) =>
                        existingUserEmailAddresses.indexOf(u.emailAddress) < 0
                )
                .map((u) => ({
                    organizations: [organization._id],
                    language: context.user?.language || fallbackLanguage,
                    ...u,
                }))
        );

        // create the organization roles for the new users
        await DBRole.insertMany(
            userDocs.map((user) => ({
                organizationId: organization._id,
                subjectId: organization._id,
                role,
                userId: user.id,
                active: true,
            }))
        );

        // send out new user account notification emails
        if (userDocs.length > 0) {
            const adminName = `${context.user?.firstName} ${context.user?.lastName}`;
            // Retrieve the language to use for sending the email
            const language = context.user?.language
                ? context.user.language.split("-")[0]
                : fallbackLanguage;

            const mailData = {
                personalizations: userDocs.map((user) => {
                    return {
                        to: [{ email: user.emailAddress }],
                        dynamic_template_data: {
                            organizationName: context.organization?.name!,
                            adminName,
                            link: `${context.domain}/auth/login`,
                        },
                    };
                }),
                reply_to: {
                    name: adminName,
                    email: context.user?.emailAddress || "",
                },
                template_id:
                    config.sendgrid.templates.addedToOrganizationNotification[
                        language
                    ],
            };

            log.debug(
                `Sending out added to organization notification emails to new users.`,
                mailData
            );

            const result = await sendEmail(mailData);

            log.debug(
                `Added to organization notification emails sent.`,
                result
            );
        }

        log.notice(
            `Added ${users.length} users to organization "${context.organization?.name}" (${context.organization?.id}).`,
            users
        );

        // return the organization
        return context.organization;
    }

    @Authorized()
    @Mutation((returns) => Organization)
    public async removeOrganizationUsers(
        @Arg("users", (type) => [ID])
        users: string[],
        @Ctx() context: RequestContext
    ) {
        const organization = context.organization;

        // check that the logged in user is allowed to update the organization
        if (!organization || !context.can(Permission.updateOrganizationUser)) {
            throw new UnauthorizedError();
        }

        // verify that there will still be an organization admin
        if (
            !(await DBRole.countDocuments({
                organizationId: organization._id,
                subjectId: organization._id,
                role: RoleType.organizationAdmin,
                userId: { $nin: users },
                active: true,
            }))
        ) {
            throw new ApolloError(
                `An organization should have at least one admin.`,
                ServerError.AtLeastOneAdminError
            );
        }

        // delete the users from the organization
        await deleteUsersFromOrganization(users, organization);

        log.debug(`Deleted users from organization.`, users);

        // return the organization
        return organization;
    }
}
