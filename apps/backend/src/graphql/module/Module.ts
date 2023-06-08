import GraphQLJSON from "graphql-type-json";
import { Field, ID, Int, ObjectType } from "type-graphql";

/** Optional field config */
const opt = { nullable: true };

@ObjectType()
export class Module {
    @Field(type => ID)
    public id: string;

    @Field()
    public createdAt: Date;

    @Field()
    public updatedAt: Date;

    @Field(opt)
    public title: string;

    @Field(opt)
    public description: string;

    @Field(opt)
    public visible: boolean;

    @Field(opt)
    public startDate: Date;

    @Field(opt)
    public endDate: Date;

    @Field(type => Int, opt)
    public index: number;

    @Field(type => GraphQLJSON, opt)
    public metadata: any;
}
