import { BlockType, ProgrammingLanguage } from "core";
import { Field, InputType } from "type-graphql";

/** Optional field config */
const opt = { nullable: true };

@InputType()
export class BlockAddInput {
    @Field((type) => String)
    public type: BlockType;

    @Field((type) => String, opt)
    public title?: String;

    @Field((type) => String, opt)
    public programmingLanguage?: ProgrammingLanguage;
}
