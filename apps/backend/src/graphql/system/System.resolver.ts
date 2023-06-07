import { environment } from "config";
import { sendEmail } from "Mail";
import { RequestContext } from "RequestContext";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { SystemInput } from "./System.input";

@Resolver()
export class SystemResolver {
    @Mutation((returns) => Boolean)
    public async reportError(
        @Ctx() context: RequestContext,
        @Arg("input") input: SystemInput
    ) {
        const {
            errorMessage,
            errorName,
            errorCause,
            errorStack,
            errorUrl,
            browserName,
            browserOS,
            browserVersion,
            userId,
        } = input;
        if (environment !== "production") {
            return false;
        }

        console.log(`Sending error report to development team...`);
        sendEmail({
            personalizations: [
                {
                    to: [{ email: "dev@quarterfall.com" }],
                },
            ],
            subject: `Error report: ${errorUrl}`,
            content: `
            <h3>Error</h3>
            <li><strong>Name: </strong>${errorName}</li>
            <li><strong>Message: </strong>${errorMessage}</li>
            <li><strong>Cause: </strong>${errorCause}</li>
            <li><strong>Stack: </strong>${errorStack}</li>
            <h3>Browser</h3>
            <li><strong>Name: </strong>${browserName}</li>
            <li><strong>Version: </strong>${browserVersion}</li>
            <li><strong>OS: </strong>${browserOS}</li>
            <li><strong>User: </strong>${userId}</li>
            `,
        });
        return true;
    }
}
