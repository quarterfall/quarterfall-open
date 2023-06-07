import { SystemEventType } from "core";
import { postEvent } from "../event/Event";
import { createContact } from "../Mail";
import express = require("express");

export function setupNewsletterSubscribe(app: express.Application) {
    app.post("/newsletter-subscribe", (request, response, next) => {
        const emailAddress = request.body?.emailAddress || "";
        if (
            !/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi.test(
                emailAddress
            )
        ) {
            response.status(400).send("Email address invalid");
            return;
        }

        // create a contact
        createContact({
            emailAddress,
            firstName: request.body?.firstName,
            lastName: request.body?.lastName,
        });

        // post a newsletter subscription event
        postEvent({
            type: SystemEventType.NewsletterSubscription,
            data: {
                emailAddress,
                firstName: request.body?.firstName,
                lastName: request.body?.lastName,
            },
        });

        response.status(200).send();
    });
}
