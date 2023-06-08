import { AnalyticsType } from "core";
import GraphQLJSON from "graphql-type-json";
import { OptionalField } from "graphql/helpers";
import { Field, ID, ObjectType } from "type-graphql";

/** Optional field config */
const opt = { nullable: true };

@ObjectType()
export class AnalyticsBlock {
    @Field((type) => ID)
    public id: string;

    @Field()
    public createdAt: Date;

    @Field()
    public updatedAt: Date;

    @OptionalField()
    public title?: string;

    @OptionalField()
    public presetName?: string;

    @Field((type) => AnalyticsType)
    public type: AnalyticsType;

    @OptionalField()
    public fullWidth?: boolean;

    @OptionalField()
    public published?: boolean;

    @OptionalField((type) => GraphQLJSON)
    public metadata?: any;
}
