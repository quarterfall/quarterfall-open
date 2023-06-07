import { ApolloServer } from "apollo-server-express";
import { environment } from "config";
import { ServerError } from "core";
import { GraphQLError } from "graphql";
import lodash from "lodash";
import { log } from "Logger";
import "reflect-metadata";
import { ForbiddenError, UnauthorizedError } from "type-graphql";
import { RequestContext } from "../RequestContext";
import { schema } from "./schema";
import express = require("express");

function replaceInObj(obj, keyForSearch: string, valueForReplace: any) {
    if (!lodash.isObject(obj)) {
        return;
    }
    const keys = Object.keys(obj);
    for (const key of keys) {
        if (key === keyForSearch) {
            obj[key] = valueForReplace;
        } else if (lodash.isObject(obj[key])) {
            replaceInObj(obj[key], keyForSearch, valueForReplace);
        }
    }
}

export const apolloLogger = {
    async requestDidStart(ctx) {
        // make a copy of the request and replace sensitive auth
        // information
        const request: express.Request = lodash.cloneDeep(ctx.request || {});
        replaceInObj(request, "password", "******");
        replaceInObj(request, "currentPassword", "******");
        replaceInObj(request, "newPassword", "******");

        const origin = ctx.request?.headers?.origin || "unknown";

        // log request information
        const user = ctx.context?.user;
        if (!user) {
            log.debug(`Anonymous request - origin: ${origin}.`, request);
        } else {
            log.debug(
                `Request by user ${user.firstName} ${user.lastName} (${user.id}) - origin: ${origin}.`,
                request
            );
        }

        return {
            async didEncounterErrors(requestContext) {
                log.error(`GraphQL request error.`);
            },
            async willSendResponse(requestContext) {
                log.debug(`Sending GraphQL response.`, requestContext.response);
            },
        };
    },
};

export async function setupGraphQL(app: express.Express) {
    const server = new ApolloServer({
        schema,
        context: async ({
            req,
            res,
        }: {
            req: express.Request;
            res: express.Response;
        }): Promise<RequestContext> => {
            // Fix the origin header to resolve CORS issues (needed since applying middleware after a GraphQL
            // request is not yet fixed)
            if (req.headers["origin"]) {
                req.res?.header(
                    "Access-Control-Allow-Origin",
                    req.headers["origin"] as string
                );
            }

            // create the context
            const context = await RequestContext.create(req, res);

            // update the user's last active date to now
            if (context.user) {
                context.user.lastActive = new Date();
                await context.user.save();
            }

            return context;
        },
        formatError: (error: GraphQLError) => {
            // Add code to errors from @Authorized decorator
            if (
                error.originalError instanceof UnauthorizedError ||
                error.originalError instanceof ForbiddenError
            ) {
                if (error.extensions) {
                    error.extensions.code = ServerError.NotAuthorized;
                }
            }
            return error;
        },
        plugins: environment !== "development" ? [apolloLogger] : undefined,
    });
    await server.start();

    // The cors should be set to false, as the apollo server overrides the express cors settings
    server.applyMiddleware({
        app,
        cors: false,
    });
}
