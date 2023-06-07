import { Field, InputType } from "type-graphql";
import { Module } from "./Module";

const opt = { nullable: true };

@InputType()
export class ModuleCreateInput implements Partial<Module> {
    @Field(opt)
    public title?: string;

    @Field(opt)
    public description?: string;
}
