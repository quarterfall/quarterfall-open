import { OptionalField } from "graphql/helpers";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class AnalyticsBlockComputeResult {
    @Field((type) => ID)
    public blockId: string;

    @OptionalField((type) => [String])
    public log: string[];

    @OptionalField()
    public result?: string;
}
