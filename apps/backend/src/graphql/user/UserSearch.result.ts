import { IUser } from "db/User";
import { User } from "graphql/user/User";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class UserSearchResult {
    @Field((type) => [User])
    public items: IUser[];

    @Field((type) => Int)
    public total: number;
}
