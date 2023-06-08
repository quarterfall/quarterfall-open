import { OptionalField } from "graphql/helpers";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export default class Feedback {
    @Field((type) => [String], { defaultValue: [] })
    public text: string[];

    @Field((type) => [String], { defaultValue: [] })
    public log: string[];

    @Field((type) => Int, { defaultValue: 0 })
    public code: number;

    @Field((type) => Int, { defaultValue: 0 })
    public attemptCount: number;

    @Field((type) => Int, { defaultValue: 0 })
    public score: number;

    @OptionalField((type) => Int)
    public originalScore?: number;

    @OptionalField((type) => String)
    public justificationText?: string;
}
