import MagicLoginStrategy from "auth/helpers/magiclogin";
import { config, environment } from "config";
import { fallbackLanguage, patterns } from "core";
import { DBUser } from "db/User";
import express from "express";
import { log } from "Logger";
import { sendEmail } from "Mail";

export const magicLoginStrategy = new MagicLoginStrategy({
    secret: config.auth.secret,
    callbackUrl: "/login/magic/complete",
    sendMagicLink: async (
        emailAddress,
        href,
        verificationCode,
        request: any
    ) => {
        await sendMagicLink(emailAddress, href, verificationCode, request);
    },
    verify: async (payload, callback, req) => {
        await verifyLoginAttempt(payload, callback, req);
    },
});

const sendMagicLink = async (
    emailAddress: string,
    href: string,
    verificationCode: string,
    request: any
) => {
    const domain = request?.headers?.origin || "";
    const nextUrl = request?.body.next || "";
    // Remove /login/magic/complete?token= from href string
    const token = href?.substring(28);

    let magicLink = `${domain}/auth/complete/${token}`;
    if (nextUrl) {
        magicLink += "?next=" + nextUrl.replace(/^\/+/g, "");
    }

    const user = await DBUser.findOne({ emailAddress });

    if (!user) {
        return false;
    }

    const language = user!.language
        ? user!.language.split("-")[0]
        : fallbackLanguage;

    const mailData = {
        personalizations: [
            {
                to: [{ email: emailAddress }],
                dynamic_template_data: {
                    link: magicLink,
                },
            },
        ],
        template_id: config.sendgrid.templates.login[language],
    };

    log.debug(`Sending magic link authentication email.`);

    const result = await sendEmail(mailData);

    log.notice(
        `Sent magic link authentication email to ${emailAddress}.`,
        result
    );
};

const verifyLoginAttempt = async (payload, callback, req: express.Request) => {
    const token = ((req.query.token || "") as string).toLowerCase();
    const emailAddress =
        (environment === "development" || environment === "devserver") &&
        !payload?.emailAddress &&
        token &&
        patterns.email.test(token)
            ? token
            : payload?.emailAddress;

    const user = await DBUser.findOne({
        emailAddress,
    });
    if (!user) {
        return callback(`No user found`);
    }

    log.info(`User ${user.firstName} ${user.lastName} logged in`);
    return callback(null, { userId: user.id, sysAdmin: user.isSysAdmin });
};
