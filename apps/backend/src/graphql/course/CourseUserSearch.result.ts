import { IUser } from "db/User";
import { User } from "graphql/user/User";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class CourseUserSearchResult {
    @Field((type) => [User])
    public users: IUser[];

    @Field((type) => Int)
    public total: number;
}
