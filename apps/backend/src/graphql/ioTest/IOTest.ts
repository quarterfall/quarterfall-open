import { Field, ID, ObjectType } from "type-graphql";

const opt = { nullable: true };

@ObjectType()
export class IOTest {
    @Field((type) => ID)
    public id: string;

    @Field()
    public name: string;

    @Field(opt)
    public description?: string;

    @Field()
    public input: string;

    @Field()
    public output: string;

    @Field()
    public comparisonCode: string;
}
