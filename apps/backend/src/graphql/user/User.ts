import GraphQLJSON from "graphql-type-json";
import { Field, ID, ObjectType } from "type-graphql";

/** Optional field config */
const opt = { nullable: true };

@ObjectType()
export class User {
    @Field(type => ID)
    public id: string;

    @Field()
    public createdAt: Date;

    @Field()
    public updatedAt: Date;

    @Field(opt)
    public firstName?: string;

    @Field(opt)
    public lastName?: string;

    @Field(opt)
    public emailAddress: string;

    @Field(opt)
    public country?: string;

    @Field(opt)
    public language?: string;

    @Field(opt)
    public isSysAdmin?: boolean;

    @Field(type => GraphQLJSON, opt)
    public metadata?: any;
}
