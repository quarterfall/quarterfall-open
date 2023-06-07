import { config } from "config";
import { DBUser } from "db/User";
import express from "express";
import { Issuer, Strategy as SurfconextStrategy } from "openid-client";
import requestIp = require("request-ip");

export const setupSurfconextStrategy = async () => {
    const oidcIssuer = await Issuer.discover(config.surfconext.issuer);
    const oidcClient = new oidcIssuer.Client({
        client_id: config.surfconext.client_id,
        client_secret: config.surfconext.client_secret,
        redirect_uris: [`${config.backend}/login/sso/surfconext/complete`],
    });

    return new SurfconextStrategy(
        { client: oidcClient, passReqToCallback: true },
        verifyLoginAttempt
    );
};

const verifyLoginAttempt = async (
    req: express.Request,
    tokenSet,
    userinfo,
    callback
) => {
    const user = await DBUser.findOne({
        emailAddress: userinfo.email?.toLowerCase(),
    });
    if (!user) {
        return callback(`User with email doesn't exist`);
    }
    // Auto register user using the OIDC claims
    const { firstName, lastName } = user;
    if (!firstName && !lastName) {
        const { given_name, family_name, locale } = userinfo;
        const language = locale === "nl" ? "nl" : "en";

        user.set({
            firstName: given_name,
            lastName: family_name,
            language,
            tosAcceptanceDate: new Date(),
            tosAcceptanceIp: requestIp.getClientIp(req),
        });
        await user.save();
    }

    return callback(null, { userId: user.id, sysAdmin: user.isSysAdmin });
};
