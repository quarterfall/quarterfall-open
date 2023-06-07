import { Field, ID, ObjectType } from "type-graphql";

const opt = { nullable: true };

@ObjectType()
export class UnitTest {
    @Field((type) => ID)
    public id: string;

    @Field()
    public name: string;

    @Field(opt)
    public description?: string;

    @Field()
    public code: string;

    @Field(opt)
    public isCode?: boolean;
}
