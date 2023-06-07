import GraphQLJSON from "graphql-type-json";
import { Field, InputType } from "type-graphql";
import { Course } from "./Course";

const opt = { nullable: true };

@InputType()
export class CourseUpdateInput implements Partial<Course> {
    @Field(opt)
    public title?: string;

    @Field(opt)
    public code?: string;

    @Field(opt)
    public description?: string;

    @Field(opt)
    public archived?: boolean;

    @Field(opt)
    public visible?: boolean;

    @Field(opt)
    public demo?: boolean;

    @Field(opt)
    public startDate?: Date;

    @Field(opt)
    public endDate?: Date;

    @Field(opt)
    public selectedImage?: string;

    @Field((type) => GraphQLJSON, opt)
    public metadata?: any;
}
