import { DatabaseDialect } from "core";
import { Field, InputType } from "type-graphql";

/** Optional field config */
const opt = { nullable: true };

@InputType()
export class ActionInput {
    @Field(opt)
    public type?: string;

    @Field(opt)
    public condition?: string;

    @Field(opt)
    public stopOnMatch?: boolean;

    @Field(opt)
    public code?: string;

    @Field(opt)
    public text?: string;

    @Field(opt)
    public textOnMismatch?: string;

    @Field(opt)
    public scoreExpression?: string;

    @Field(opt)
    public gitUrl?: string;

    @Field(opt)
    public gitBranch?: string;

    @Field(opt)
    public gitPrivateKey?: string;

    @Field(opt)
    public databaseFileLabel?: string;

    @Field(opt)
    public databaseDialect?: DatabaseDialect;

    @Field(opt)
    public path?: string;

    @Field(opt)
    public url?: string;

    @Field(opt)
    public answerEmbedding?: string;

    @Field(opt)
    public imports?: string;

    @Field(opt)
    public hideFeedback?: boolean;

    @Field(opt)
    public teacherOnly?: boolean;

    @Field(opt)
    public forceOverrideCache?: boolean;
}
