import { ApolloError } from "apollo-server-express";
import { config } from "config";
import {
    gradingSchemeDefaults,
    OrganizationEventType,
    Permission,
    RoleType,
    ServerError,
} from "core";
import { DBAnalyticsBlock } from "db/AnalyticsBlock";
import { DBGradingScheme } from "db/GradingScheme";
import { DBOrganization, IOrganization } from "db/Organization";
import { DBRole } from "db/Role";
import { DBUser } from "db/User";
import { postEvent } from "event/Event";
import { GradingScheme } from "graphql/gradingScheme/GradingScheme";
import { User } from "graphql/user/User";
import { log } from "Logger";
import { Types } from "mongoose";
import { deleteOrganization } from "operations/Organization.operation";
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
import { RequestContext } from "../../RequestContext";
import { Organization } from "./Organization";
import { OrganizationCreateInput } from "./OrganizationCreate.input";
import { OrganizationUpdateInput } from "./OrganizationUpdate.input";

const opt = { nullable: true };

@Resolver(Organization)
export class OrganizationResolver {
    //
    // Queries
    //

    @Query((returns) => Organization, opt)
    public async organization(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ) {
        // anyone can read general organization information
        const organization = await context.loader(DBOrganization).load(id);
        return !organization.archived || context.isSysAdmin
            ? organization
            : null;
    }

    //
    // Mutations
    //

    @Authorized()
    @Mutation((returns) => Organization)
    public async createOrganization(
        @Ctx() context: RequestContext,
        @Arg("input") input: OrganizationCreateInput
    ): Promise<IOrganization> {
        const { name, emailAddress } = input;
        // only system admins can create an organization
        if (!context.isSysAdmin) {
            throw new UnauthorizedError();
        }

        // create a organization
        const organization = await DBOrganization.create({
            name,
        });

        // check whether the user already exists
        let user = await DBUser.findOne({
            emailAddress,
        });

        // if the user doesn't exist, create one
        if (!user) {
            user = await DBUser.create({
                organizations: [organization._id],
                emailAddress,
            });
        }

        // create the organization admin role
        await DBRole.create({
            organizationId: organization._id,
            userId: user._id,
            subjectId: organization._id,
            role: RoleType.organizationAdmin,
            name,
        });

        // retrieve the analytics blocks of the default organization
        const defaultOrganization = await DBOrganization.findById(
            context.system.analyticsDefaultOrganizationId
        );
        const courseAnalyticsBlockDefaults =
            defaultOrganization?.courseAnalyticsBlockDefaults || [];
        const analyticsBlocks = await DBAnalyticsBlock.find({
            _id: { $in: courseAnalyticsBlockDefaults },
        });

        // create a copy of the default course analytics blocks
        organization.courseAnalyticsBlockDefaults = await Promise.all(
            courseAnalyticsBlockDefaults.map(async (blockId) => {
                const block = analyticsBlocks.find((b) =>
                    b._id.equals(blockId)
                );
                if (!block) {
                    return;
                }
                block._id = new Types.ObjectId();
                block.isNew = true;
                block.subjectId = organization._id;
                await block.save();
                return block._id;
            })
        );

        // add default grading schemes to the organization
        await Promise.all(
            gradingSchemeDefaults.map(async (scheme) => {
                const newScheme = { ...scheme, id: undefined };
                await new DBGradingScheme({
                    ...newScheme,
                    organizationId: organization?.id,
                }).save();
            })
        );

        await organization.save();

        // post an organization created event
        postEvent({
            type: OrganizationEventType.OrganizationCreated,
            organizationId: organization.id,
            data: {
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    emailAddress: user.emailAddress,
                },
                organization: {
                    id: organization.id,
                    name: organization.name,
                },
            },
        });

        log.notice(`A new organization has been created.`, { organization });

        // create the organization admin role
        await new DBRole({
            organizationId: organization._id,
            userId: user._id,
            subjectId: organization._id,
            role: RoleType.organizationAdmin,
            active: true,
        }).save();

        // add the organization to the user's organization list
        user.organizations = user.organizations || [];
        user.organizations.push(organization._id);
        await user.save();

        return organization;
    }

    @Authorized()
    @Mutation((returns) => Organization)
    public async switchToOrganization(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ) {
        const user = context.user;
        if (!user) {
            throw new UnauthorizedError();
        }

        // you can always access the organizations belonging to the user of the same email address
        // this allows us to add switching (only used in development for now)
        const proUser = await DBUser.findOne({
            emailAddress: user.emailAddress,
        });
        const organizations = proUser?.organizations || [];
        const newOrganizationId = organizations.find((o) => o.equals(id));
        if (!newOrganizationId) {
            throw new ApolloError(
                `You don't have an account at this organization.`,
                ServerError.NotAuthorized
            );
        }
        context.res.cookie("currentOrganization", id, {
            domain: config.domain,
        });
        return DBOrganization.findById(newOrganizationId);
    }

    @Authorized()
    @Mutation((returns) => Organization)
    public async updateOrganization(
        @Arg("id", (type) => ID, opt) id: string,
        @Arg("input") input: OrganizationUpdateInput,
        @Ctx() context: RequestContext
    ) {
        // if supplying a different id, check that the user is a sys admin
        if (id && id !== context.organization?.id && !context.isSysAdmin) {
            throw new UnauthorizedError();
        }
        // check that the logged in user is admin of this organization
        if (!context.can(Permission.updateOrganization)) {
            throw new UnauthorizedError();
        }

        // some fields can only be updated by system administrators
        const inputBefore = JSON.stringify(input);
        if (!context.isSysAdmin) {
            delete input.licenseRemark;
            delete input.licenseRenewalDate;
            delete input.licenseTotalStudentCredits;
            delete input.licenseUsedStudentCredits;
            delete input.archived;
            delete input.subdomain;
        }

        // verify that the user can update billing fields
        if (!context.can(Permission.updateOrganizationLicense)) {
            delete input.billingName;
            delete input.billingEmailAddress;
            delete input.billingPhoneNumber;
            delete input.billingAddressLine1;
            delete input.billingAddressLine2;
            delete input.billingPostalCode;
            delete input.billingCity;
            delete input.billingCountryCode;
            delete input.billingVAT;
        }

        // the user tried to do something that wasn't allowed, so throw an error
        if (JSON.stringify(input) !== inputBefore) {
            throw new UnauthorizedError();
        }

        const organization = await DBOrganization.findByIdAndUpdate(
            id || context.organization?.id,
            input,
            {
                new: true,
            }
        );

        log.notice(
            `Organization with id ${organization?.id} updated.`,
            organization?.toJSON()
        );

        return organization;
    }

    @Authorized()
    @Mutation((returns) => Organization)
    public async deleteOrganization(
        @Arg("id", (type) => ID, opt) id: string,
        @Ctx() context: RequestContext
    ) {
        if (!context.isSysAdmin) {
            throw new UnauthorizedError();
        }
        const organization = await DBOrganization.findById(id);
        if (!organization) {
            throw new ApolloError(
                `Organization with id ${id} not found.`,
                ServerError.NotFound
            );
        }
        await deleteOrganization(organization);
        return organization;
    }

    //
    // Field resolvers
    //

    @FieldResolver((type) => RoleType, opt)
    public role(
        @Root() root: IOrganization,
        @Ctx() context: RequestContext
    ): RoleType | undefined {
        return context.getRole(root);
    }

    @FieldResolver((type) => [Permission])
    public permissions(
        @Root() root: IOrganization,
        @Ctx() context: RequestContext
    ) {
        return context.getPermissions(root);
    }

    @FieldResolver((type) => GradingScheme)
    public async gradingSchemes(@Ctx() context: RequestContext) {
        return DBGradingScheme.find({
            organizationId: context.organization?.id,
        });
    }

    @FieldResolver((type) => [User])
    public async admins(
        @Root() root: IOrganization,
        @Ctx() context: RequestContext
    ) {
        // this information is only accessible to system admins
        if (!context.isSysAdmin) {
            return [];
        }
        const organizationId = root.id;
        // retrieve the roles
        const roles = await DBRole.find({
            organizationId,
            subjectId: organizationId,
            active: true,
            role: RoleType.organizationAdmin,
        });
        // retrieve the users associated with the roles
        return DBUser.find({ _id: { $in: roles.map((r) => r.userId) } });
    }
}
