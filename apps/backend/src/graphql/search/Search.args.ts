import { SortingOrder } from "core";
import { OptionalField } from "graphql/helpers";
import { ArgsType, Int } from "type-graphql";

@ArgsType()
export class SearchArgs {
    @OptionalField()
    public orderBy?: string;

    @OptionalField(() => SortingOrder)
    public order?: SortingOrder;

    @OptionalField()
    public term?: string;

    @OptionalField(() => Int)
    public pageSize?: number;

    @OptionalField(() => Int)
    public page?: number;
}
