import { OptionalField } from "graphql/helpers";
import { SearchArgs } from "graphql/search/Search.args";
import { ArgsType, Field, ID } from "type-graphql";

/** Optional field config */
const opt = { nullable: true };

@ArgsType()
export class SubmissionSearchArgs extends SearchArgs {
    @Field((type) => ID)
    public courseId: string;

    @OptionalField((type) => [ID])
    public assignmentIds?: string[];

    @OptionalField((type) => [ID])
    public moduleIds?: string[];

    @OptionalField((type) => [ID])
    public userIds?: string;

    @OptionalField((type) => Boolean)
    public hideApproved?: boolean;

    @OptionalField((type) => Boolean)
    public hideUnapproved?: boolean;
}
