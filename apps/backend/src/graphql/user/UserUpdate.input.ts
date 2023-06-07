import { RoleType } from "core";
import GraphQLJSON from "graphql-type-json";
import { Field, InputType } from "type-graphql";
import { User } from "./User";

const opt = { nullable: true };

@InputType()
export class UserUpdateInput implements Partial<User> {
    @Field(opt)
    public firstName?: string;

    @Field(opt)
    public lastName?: string;

    @Field(opt)
    public country?: string;

    @Field(opt)
    public language?: string;

    @Field((type) => RoleType, opt)
    public organizationRole?: RoleType;

    @Field((type) => GraphQLJSON, opt)
    public metadata?: any;
}
