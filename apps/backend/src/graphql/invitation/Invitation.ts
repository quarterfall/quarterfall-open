import { Field, ID, ObjectType } from "type-graphql";

/** Optional field config */
const opt = { nullable: true };

@ObjectType()
export class Invitation {
    @Field((type) => ID)
    public id: string;

    @Field()
    public createdAt: Date;

    @Field()
    public updatedAt: Date;
}
