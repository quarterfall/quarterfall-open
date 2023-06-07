import express = require("express");
import { sendEmail } from "../Mail";

export function setupSendMessage(app: express.Application) {
    app.post("/send-message", (request, response, next) => {
        const firstName = request.body?.firstName || "";
        const lastName = request.body?.lastName || "";
        const emailAddress = request.body?.emailAddress || "";
        const content = (request.body?.message || "").split("\n").join("<br/>");
        if (
            !/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi.test(
                emailAddress
            )
        ) {
            response.status(400).send("Email address invalid.");
            return;
        }
        if (!content) {
            response.status(400).send("Cannot send empty message.");
            return;
        }

        // construct the mail data
        const mailData = {
            personalizations: [
                {
                    to: [{ email: "info@quarterfall.com" }],
                },
            ],
            reply_to: {
                name:
                    firstName || lastName
                        ? `${firstName} ${lastName}`.trim()
                        : undefined,
                email: emailAddress,
            },
            subject: "Message via website",
            content,
        };

        // send the mail
        sendEmail(mailData);

        response.status(200).send();
    });
}
