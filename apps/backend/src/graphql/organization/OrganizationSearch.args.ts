import { OptionalField } from "graphql/helpers";
import { SearchArgs } from "graphql/search/Search.args";
import { ArgsType } from "type-graphql";

@ArgsType()
export class OrganizationSearchArgs extends SearchArgs {
    @OptionalField()
    public showArchived?: boolean;
}
