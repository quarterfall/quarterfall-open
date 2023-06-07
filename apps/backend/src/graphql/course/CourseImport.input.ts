import { Field, InputType } from "type-graphql";

const opt = { nullable: true };

@InputType()
export class CourseImportInput {
    @Field()
    public code: string;

    @Field(opt)
    public startDate?: Date;

    @Field(opt)
    public endDate?: Date;
}
