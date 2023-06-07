import { OptionalField } from "graphql/helpers";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class AnalyticsBlockCache {
    @Field((type) => ID)
    public id: string;

    @OptionalField((type) => ID)
    public targetId?: string;

    @OptionalField()
    public result?: string;
}
