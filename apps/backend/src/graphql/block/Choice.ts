import { Field, ID, ObjectType } from "type-graphql";

/** Optional field config */
const opt = { nullable: true };

@ObjectType()
export class Choice {
    @Field((type) => ID)
    public id: string;

    @Field(opt)
    public label?: string;

    @Field(opt)
    public text?: string;

    @Field(opt)
    public correct?: boolean;

    @Field((type) => Number, opt)
    public correctScore?: number;

    @Field((type) => Number, opt)
    public wrongScore?: number;
}
