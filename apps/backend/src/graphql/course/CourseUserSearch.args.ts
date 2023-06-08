import { RoleType } from "core";
import { OptionalField } from "graphql/helpers";
import { SearchArgs } from "graphql/search/Search.args";
import { ArgsType, Field, ID } from "type-graphql";

@ArgsType()
export class CourseUserSearchArgs extends SearchArgs {
    @Field((type) => ID)
    public courseId: string;

    @OptionalField((type) => [RoleType])
    public roles?: RoleType[];
}
