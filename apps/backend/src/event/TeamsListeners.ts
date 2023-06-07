import { environment } from "config";
import {
    CourseEventType,
    OrganizationEventType,
    RoleType,
    SystemEventType,
    UserEventType,
} from "core";
import { sendEmail } from "../Mail";
import { CourseCreatedEventData } from "./CourseEventData";
import { addListener, EventData } from "./Event";
import { OrganizationLicenseUpdatedEventData } from "./OrganizationEventData";
import { NewsletterSubscribeEventData } from "./SystemEventData";
import { UserUpdatedEventData } from "./UserEventData";

export const channels = {
    application: "61646614.quarterfall.com@emea.teams.ms",
    sales: "e71d9ca5.quarterfall.com@emea.teams.ms",
};

function sendTeamsMessage(
    subject: string,
    content: string,
    channel: string = channels.application
) {
    // only send a message to Teams in production
    if (environment !== "production") {
        return;
    }
    sendEmail({
        personalizations: [
            {
                to: [{ email: channel }],
            },
        ],
        subject,
        content,
    });
}

function handleLicenseOrdersEvent(
    event: EventData<OrganizationLicenseUpdatedEventData>
) {
    const { data } = event;
    const { user, organization, orderComment } = data;

    sendTeamsMessage(
        `The license for "${organization?.name}" has been upgraded to a Standard license.`,
        `Organization: ${organization?.name} (id: ${organization?.id})<br>
        User: ${
            user?.firstName && user?.lastName
                ? `${user?.firstName} ${user?.lastName}`
                : "-"
        } (${user.id}, <a href="mailto:${user?.emailAddress}">${
            user?.emailAddress
        }</a>)<br>
            Order comment: ${orderComment || "-"}`,
        channels.sales
    );
}

function handleUserUpdatedEvent(event: EventData<UserUpdatedEventData>) {
    const { data } = event;
    const { user, userRole, context, organization } = data;

    // send a Teams message if a new account has been created
    if (
        context === "accountActivation" &&
        userRole !== RoleType.organizationStudent
    ) {
        sendTeamsMessage(
            `A user has activated their account`,
            `Existing organization: ${organization?.name} (id: ${
                organization?.id
            })<br>
        User: ${
            user?.firstName && user?.lastName
                ? `${user?.firstName} ${user?.lastName}`
                : "-"
        } (${user.id}, <a href="mailto:${user?.emailAddress}">${
                user?.emailAddress
            }</a>)<br>
            Role: ${userRole}`,
            channels.application
        );
    }
}

function handleCourseCreatedEvent(event: EventData<CourseCreatedEventData>) {
    const { data } = event;
    const { source, course, user, organization } = data;

    sendTeamsMessage(
        `A course has been ${source ? "duplicated" : "created"}: "${
            course?.title
        }" (code: ${course?.code || "-"})`,
        `${source ? `Original course id: ${source.id}<br>` : ""}Course id: ${
            course?.id
        }<br>
        Organization: ${organization?.name} (id: ${organization?.id})<br>
        User: ${
            user?.firstName && user?.lastName
                ? `${user?.firstName} ${user?.lastName}`
                : "-"
        } (${user.id}, <a href="mailto:${user?.emailAddress}">${
            user?.emailAddress
        }</a>)`,
        channels.application
    );
}

function handleNewsletterSubscriptionEvent(
    event: EventData<NewsletterSubscribeEventData>
) {
    const { data } = event;
    const { firstName, lastName, emailAddress } = data;

    sendTeamsMessage(
        `A user has subscribed to the newsletter`,
        `Email address: <a href="mailto:${emailAddress}">${emailAddress}</a><br>
        First name: ${firstName ? "" : "-"}<br>
        Last name: ${lastName ? "" : "-"}<br>`,
        channels.sales
    );
}

export function setupTeamsEventListeners() {
    addListener(CourseEventType.CourseCreated, handleCourseCreatedEvent);
    addListener(
        SystemEventType.NewsletterSubscription,
        handleNewsletterSubscriptionEvent
    );
    addListener(UserEventType.UserUpdated, handleUserUpdatedEvent);
    addListener(
        OrganizationEventType.OrganizationLicenseUpdated,
        handleLicenseOrdersEvent
    );
}
