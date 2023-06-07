import GraphQLJSON from "graphql-type-json";
import { OptionalField } from "graphql/helpers";
import { InputType } from "type-graphql";

/** Optional field config */
const opt = { nullable: true };

@InputType()
export class AnalyticsBlockUpdateInput {
    @OptionalField()
    public title?: string;

    @OptionalField()
    public code?: string;

    @OptionalField()
    public fullWidth?: boolean;

    @OptionalField((type) => GraphQLJSON)
    public metadata?: any;
}
