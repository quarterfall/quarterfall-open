import { Field, InputType } from "type-graphql";

const opt = { nullable: true };

@InputType()
export class NotificationInput {
    @Field(opt)
    public read?: boolean;

    @Field(opt)
    public hidden?: boolean;
}
