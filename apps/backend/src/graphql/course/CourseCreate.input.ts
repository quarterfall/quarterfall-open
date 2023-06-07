import { Field, InputType } from "type-graphql";
import { Course } from "./Course";

const opt = { nullable: true };

@InputType()
export class CourseCreateInput implements Partial<Course> {
    @Field(opt)
    public title?: string;

    @Field(opt)
    public code?: string;

    @Field(opt)
    public description?: string;

    @Field(opt)
    public visible?: boolean;

    @Field(opt)
    public startDate?: Date;

    @Field(opt)
    public endDate?: Date;
}
