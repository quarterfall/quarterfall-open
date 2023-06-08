import GraphQLJSON from "graphql-type-json";
import { Field, ID, ObjectType } from "type-graphql";

/** Optional field config */
const opt = { nullable: true };

@ObjectType()
export class Course {
    @Field((type) => ID)
    public id: string;

    @Field()
    public createdAt: Date;

    @Field()
    public updatedAt: Date;

    @Field()
    public title: string;

    @Field(opt)
    public code?: string;

    @Field(opt)
    public description?: string;

    @Field(opt)
    public publicCode?: string;

    @Field(opt)
    public enrollmentCode?: string;

    @Field(opt)
    public archived?: boolean;

    @Field(opt)
    public visible?: boolean;

    @Field(opt)
    public demo?: boolean;

    @Field(opt)
    public library?: boolean;

    @Field(opt)
    public startDate: Date;

    @Field(opt)
    public endDate: Date;

    @Field(opt)
    public selectedImage?: string;

    @Field((type) => GraphQLJSON, opt)
    public metadata: any;
}
