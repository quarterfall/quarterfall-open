import { organizationHasSSO } from "auth/helpers/login";
import { magicLoginStrategy } from "auth/strategies/MagicLinkStrategy";
import { config, environment } from "config";
import { ServerError } from "core";
import { DBUser } from "db/User";
import { registerUser } from "./helpers/register";
import express = require("express");
import passport = require("passport");

// Start registration
export const startRegistration = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const { input } = req.body;

    if (!input) {
        res.status(400).json({ success: false, message: "No input" });
        return;
    }

    await registerUser(req, res);

    // This is required as the magic login strategy login uses the email address directly within the body
    req.body.emailAddress = input.emailAddress;

    return magicLoginStrategy.send(req, res);
};

// Start login

export const startLogin = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    // Logout existing user
    req.logout((err) => {
        if (err) {
            return next(err);
        }
    });

    // Receive emailAddress from POST request body
    const { emailAddress }: { emailAddress: string } = req.body;
    const user = await DBUser.findOne({
        emailAddress,
    });

    if (!user) {
        res.status(404).json({
            message: ServerError.NotFound,
        });
        return;
    }
    if (await organizationHasSSO(user)) {
        res.status(200).json({
            success: true,
            ssoUrl: `${config.backend}/login/sso/surfconext`,
        });
        return;
    }
    return magicLoginStrategy.send(req, res);
};

export const startSurfconextLogin = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    passport.authenticate("surfconext", {
        scope: "openid, email, profile",
    })(req, res, next);
};

//Sys admin only login as user

export const loginAsUser = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const isSysAdmin = (req?.session as any)?.passport?.user?.sysAdmin;

    const {
        emailAddress,
        sysAdmin,
    }: { emailAddress: string; sysAdmin: boolean } = req.body;

    // verify that the currently logged in user is a system admin
    if (!isSysAdmin) {
        res.status(401).json({
            message: "User not authorized",
            success: false,
        });
        return;
    }

    const user = await DBUser.findOne({
        emailAddress,
    });
    if (!user) {
        res.status(404).json({
            message: "User not found",
        });
        return;
    }
    (req.session as any).passport.user.userId = user.id;
    (req.session as any).passport.user.sysAdmin = sysAdmin;
    req.session.save(function (err) {
        next(err);
    });

    return res.status(200).json({ success: true });
};

//Magic login complete

export const magicLoginComplete = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    passport.authenticate(
        "magiclogin",
        {
            failureFlash: true,
            failureRedirect: `${process.env.FRONTEND_SERVER_URL}/auth/login`,
        },
        (err, user, info) => {
            if (!user || err) return next(err);
            req.login(user, (err) => {
                if (err) return next(err);
                return res.redirect("/");
            });
        }
    )(req, res, next);
};

//Surfconext login complete

export const surfconextLoginComplete = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    passport.authenticate(
        "surfconext",
        {
            failureFlash: true,
            failureRedirect: `${process.env.FRONTEND_SERVER_URL}/auth/login`,
        },
        (err, user, info) => {
            if (!user || err) return next(err);
            req.login(user, (err) => {
                if (err) return next(err);
                return res.redirect(`${process.env.FRONTEND_SERVER_URL}`);
            });
        }
    )(req, res, next);
};

// Logout

export const logout = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    // Logout existing user
    req.logout((err) => {
        if (err) {
            res.status(500).json({ message: err });
            return;
        }
        // This removes the session from the MongoDB store
        (req.session as any) = null;
        res.status(200).json({ message: "Logged out" });
        return;
    });
};
