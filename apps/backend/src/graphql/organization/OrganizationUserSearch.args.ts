import { RoleType } from "core";
import { OptionalField } from "graphql/helpers";
import { SearchArgs } from "graphql/search/Search.args";
import { ArgsType, ID } from "type-graphql";

@ArgsType()
export class OrganizationUserSearchArgs extends SearchArgs {
    @OptionalField((type) => ID)
    public id?: string;

    @OptionalField((type) => [RoleType])
    public roles?: RoleType[];
}
