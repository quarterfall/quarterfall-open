import client from "@sendgrid/client";
import { environment } from "config";

export interface Person {
    email: string;
    name?: string;
}

export interface Personalization {
    to: Person[];
    cc?: Person[];
    bcc?: Person[];
    subject?: string;
    dynamic_template_data?: Record<string, string>;
}

export interface SendEmailOptions {
    personalizations: Personalization[];
    from?: Person;
    reply_to?: Person;
    subject?: string;
    content?: string;
    attachments?: any[];
    template_id?: string;
}

export async function sendEmail(options: SendEmailOptions) {
    if (!options.personalizations || options.personalizations.length === 0) {
        return;
    }
    // set the default values
    options = Object.assign(
        {
            from: {
                email: process.env.CONTACT_EMAIL_ADDRESS,
                name: "Quarterfall",
            },
        },
        options
    );

    const mail: any = {
        personalizations: options.personalizations,
        from: options.from,
        headers: {
            "List-Unsubscribe": `<mailto:${process.env.CONTACT_EMAIL_ADDRESS}>`,
        },
    };
    if (options.reply_to) {
        mail.reply_to = options.reply_to;
    }
    if (options.subject) {
        mail.subject = options.subject;
    }
    if (options.content) {
        mail.content = [
            {
                type: "text/html",
                value: options.content,
            },
        ];
    }
    if (options.attachments && options.attachments.length > 0) {
        mail.attachments = options.attachments;
    }
    if (options.template_id) {
        mail.template_id = options.template_id;
    }

    try {
        const result = await client.request({
            method: "POST",
            url: "/v3/mail/send",
            body: mail,
        });
        console.log(mail);
        const [response, body] = result;

        return {
            statusCode: response.statusCode,
            body,
        };
    } catch (err: any) {
        console.error(JSON.stringify(err.response.data.errors));
        return {
            statusCode: 500,
            body: err.response.data.errors,
        };
    }
}

export interface Contact {
    id: string; // the sendgrid id
    emailAddress: string;
    firstName?: string;
    lastName?: string;
}

export async function getContact(
    emailAddress: string
): Promise<Contact | null> {
    const query = `email LIKE '${emailAddress}'`;
    try {
        const result = await client.request({
            method: "POST",
            url: "/v3/marketing/contacts/search",
            body: {
                query,
            },
        });
        const [response, body] = result;

        const contacts = body.result || [];
        if (!contacts || contacts.length === 0) {
            return null;
        }
        // construct the contact
        return {
            firstName: contacts[0].first_name || "",
            lastName: contacts[0].last_name || "",
            emailAddress: contacts[0].email || "",
            id: contacts[0].id,
        };
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function updateContact(
    emailAddress: string,
    data: Partial<Omit<Contact, "id">>
) {
    // retrieve the old contact
    const contact = await getContact(emailAddress);

    if (!contact) {
        console.info(
            `Unable to find SendGrid contact with email address ${emailAddress}.`
        );
        return;
    }

    if (data.emailAddress && data.emailAddress !== contact.emailAddress) {
        // delete the old contact
        await deleteContactById(contact.id);
    }

    // create a new contact with the new email address and other data
    return createContact({ ...contact, ...data });
}

export async function createContact(contact: Omit<Contact, "id">) {
    return createContacts([contact]);
}

export async function createContacts(contacts: Omit<Contact, "id">[]) {
    const contactData = contacts.map((c) => ({
        first_name: c.firstName,
        last_name: c.lastName,
        email: c.emailAddress,
    }));
    try {
        await client.request({
            method: "PUT",
            url: "/v3/marketing/contacts",
            body: {
                contacts: contactData,
            },
        });
    } catch (err) {
        console.error(err);
    }
}

export async function deleteContact(emailAddress: string) {
    // retrieve the contact to get the id
    const contact = await getContact(emailAddress);
    // delete the contact if found
    if (contact) {
        await deleteContacts([contact.id]);
    }
}

export async function deleteContactById(id: string) {
    return deleteContacts([id]);
}

export async function deleteContacts(ids: string[]) {
    try {
        await client.request({
            method: "DELETE",
            url: `/v3/marketing/contacts?ids=${ids.join(",")}`,
        });
    } catch (err) {
        console.error(err);
    }
}
