import express = require("express");
import { ApolloError } from "apollo-server-express";
import { config, environment } from "config";
import { getParentPermission, Permission, RoleType, ServerError } from "core";
import { ICourse } from "db/Course";
import { DBOrganization, IOrganization } from "db/Organization";
import { DBRole, IRole } from "db/Role";
import { DBSystem, ISystem } from "db/System";
import { DBUser, IUser } from "db/User";
import lodash from "lodash";
import { getPermissionsForRole } from "./RolePermissions";
import mongoose = require("mongoose");
import DataLoader = require("graphql-dataloader-mongoose");

export interface RequestContextOptions {
    req: express.Request;
    res: express.Response;
    roles?: IRole[];
    system: ISystem;
    user?: IUser;
    organization?: IOrganization;
}

export interface RequestContextCreateOptions {
    req: express.Request;
    res: express.Response;
}

export class RequestContext {
    public user?: IUser;
    public roles: IRole[];
    public organization?: IOrganization;
    public dataloaderFactory: DataLoader.MongooseDataloaderFactory;
    public system: ISystem;
    public domain: string;

    public req: express.Request;
    public res: express.Response;

    constructor(options: RequestContextOptions) {
        const { user, roles = [], organization, req, res, system } = options;
        this.user = user;
        this.roles = roles;
        this.organization = organization;
        this.req = req;
        this.res = res;
        this.system = system;
        this.domain = req.headers?.origin || "";
        this.dataloaderFactory = new DataLoader.MongooseDataloaderFactory();
        // prime the user, organization and roles
        if (user) {
            this.loader(DBUser).prime(user.id, user);
        }
        if (organization) {
            this.loader(DBOrganization).prime(organization.id, organization);
        }
        for (const role of roles) {
            this.loader(DBRole).prime(role.id, role);
        }
    }

    public static async create(
        req: express.Request,
        res: express.Response
    ): Promise<RequestContext> {
        const userId = (req?.session as any)?.passport?.user?.userId;

        // retrieve the user
        const user = userId ? await DBUser.findById(userId) : undefined;

        // retrieve the organization id from the cookie (if we're accessing the system from the pro license)
        let organizationId = req.cookies["currentOrganization"];

        // retrieve the roles for this user
        const roles = user
            ? await DBRole.find({
                  organizationId,
                  userId: user._id,
                  active: true,
              })
            : [];

        // retrieve the user's organizations
        const organizations = user
            ? await DBOrganization.find({
                  _id: { $in: user.organizations || [] },
              })
            : [];

        // verify that the organization id is valid
        if (!organizations.find((o) => o._id.equals(organizationId))) {
            organizationId = undefined;
        }

        // in case of the pro license verify that the organization id is valid
        if (user && !organizationId && organizations.length > 0) {
            organizationId = organizations[0].id;
            res.cookie("currentOrganization", organizationId, {
                domain: config.domain,
            });
        }

        // retrieve the current organization of this user if applicable
        const organization = organizations.find((o) =>
            o._id.equals(organizationId)
        );

        // if there is no organization for some reason, throw an error
        if (environment !== "development" && user && !organization) {
            throw new ApolloError(
                `You don't have access to the Quarterfall platform.`,
                ServerError.NotAuthorized
            );
        }

        // retrieve the overall system settings (or create if missing)
        let system = await DBSystem.findOne();
        if (!system) {
            system = await new DBSystem().save();
        }

        // create the context
        return new RequestContext({
            req,
            res,
            user: user || undefined,
            roles,
            organization: organization || undefined,
            system,
        });
    }

    public get isSysAdmin(): boolean {
        return Boolean(
            (this.req?.session as any)?.passport?.user?.sysAdmin ||
                this.user?.isSysAdmin
        );
    }

    // Retrieving a data loader
    public loader<T extends mongoose.Document>(
        model: mongoose.Model<T>,
        key: string = "_id"
    ) {
        return this.dataloaderFactory.mongooseLoader(model).dataloader(key);
    }

    public loadById<T extends mongoose.Document>(
        model: mongoose.Model<T>,
        id?: string | mongoose.Types.ObjectId
    ) {
        if (!id) {
            return null;
        }
        if (lodash.isString(id)) {
            return this.loader(model).load(id);
        } else {
            return this.loader(model).load(id.toHexString());
        }
    }

    public loadMany<T extends mongoose.Document>(
        model: mongoose.Model<T>,
        ids: (string | mongoose.Types.ObjectId)[]
    ) {
        const parsedIds = ids.map((id) =>
            lodash.isString(id) ? id : id.toHexString()
        );
        return this.loader(model).loadMany(parsedIds);
    }

    public prime<T extends mongoose.Document>(
        model: mongoose.Model<T>,
        docs: T | T[]
    ) {
        docs = new Array<T>().concat(docs);
        const loader = this.loader(model);
        for (const doc of docs) {
            loader.prime(doc.id, doc);
        }
    }

    // Finding roles and permissions

    public getRole(
        subject?: IOrganization | ICourse | null
    ): RoleType | undefined {
        const subjectId = subject?._id || this.organization?._id;
        const role = this.roles.find(
            (r) => subjectId && r.subjectId?.equals(subjectId)
        );
        return role?.role;
    }

    public getPermissions(
        subject?: IOrganization | ICourse | null
    ): Permission[] {
        const role = this.getRole(subject);
        return getPermissionsForRole(role);
    }

    public can(permission: Permission, course?: ICourse | null) {
        // system admins always have permission
        if (this.isSysAdmin) {
            return true;
        }

        // construct the list of input permissions
        const input = [permission];
        const parent = getParentPermission(permission);
        if (parent) {
            input.push(parent);
        }

        // get all the permissions that the user has for the course and the organization
        const userPermissions: Permission[] = this.getPermissions();
        userPermissions.push(...this.getPermissions(course));
        return input.some((p) => userPermissions.includes(p));
    }
}
