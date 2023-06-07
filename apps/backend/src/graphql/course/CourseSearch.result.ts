import { ICourse } from "db/Course";
import { Field, Int, ObjectType } from "type-graphql";
import { Course } from "./Course";

@ObjectType()
export class CourseSearchResult {
    @Field((type) => [Course])
    public items: ICourse[];

    @Field((type) => Int)
    public total: number;
}
