import { OptionalField } from "graphql/helpers";
import { Field, InputType } from "type-graphql";

const opt = { nullable: true };

@InputType()
export class UserCreateInput {
    @Field()
    public emailAddress: string;

    @OptionalField()
    public firstName?: string;

    @OptionalField()
    public lastName?: string;
}
