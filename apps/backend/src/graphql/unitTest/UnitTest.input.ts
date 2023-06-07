import { Field, InputType } from "type-graphql";

/** Optional field config */
const opt = { nullable: true };

@InputType()
export class UnitTestInput {
    @Field(opt)
    public name?: string;

    @Field(opt)
    public description?: string;

    @Field(opt)
    public code?: string;

    @Field(opt)
    public isCode?: boolean;
}
