import GraphQLJSON from "graphql-type-json";
import { Field, InputType } from "type-graphql";
import { Module } from "./Module";

const opt = { nullable: true };

@InputType()
export class ModuleUpdateInput implements Partial<Module> {
    @Field(opt)
    public title?: string;

    @Field(opt)
    public description?: string;

    @Field(opt)
    public visible?: boolean;

    @Field(opt)
    public startDate?: Date;

    @Field(opt)
    public endDate?: Date;

    @Field(type => GraphQLJSON, opt)
    public metadata?: any;
}
