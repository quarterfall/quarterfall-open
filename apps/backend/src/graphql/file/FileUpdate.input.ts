import { Field, InputType } from "type-graphql";

const opt = { nullable: true };

@InputType()
export class FileUpdateInput {
    @Field(opt)
    public label?: string;
}
