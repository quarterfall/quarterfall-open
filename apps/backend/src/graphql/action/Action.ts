import {
    ActionType,
    DatabaseDialect,
    IOTest as ActionIOTest,
    UnitTest as ActionUnitTest,
} from "core";
import { IOTest } from "graphql/ioTest/IOTest";
import { UnitTest } from "graphql/unitTest/UnitTest";
import { Field, ID, ObjectType } from "type-graphql";

/** Optional field config */
const opt = { nullable: true };

@ObjectType()
export class Action {
    @Field((type) => ID)
    public id: string;

    @Field((type) => ID)
    public blockId: string;

    @Field((type) => String)
    public type: ActionType;

    @Field(opt)
    public condition?: string;

    @Field(opt)
    public stopOnMatch?: boolean;

    @Field(opt)
    public code?: string;

    @Field(opt)
    public scoreExpression?: string;

    @Field(opt)
    public text?: string;

    @Field(opt)
    public textOnMismatch?: string;

    @Field(opt)
    public gitUrl?: string;

    @Field(opt)
    public gitBranch?: string;

    @Field(opt)
    public databaseFileLabel?: string;

    @Field(opt)
    public databaseDialect?: DatabaseDialect;

    @Field(opt)
    public path?: string;

    @Field(opt)
    public url?: string;

    @Field((type) => [UnitTest], opt)
    public tests?: ActionUnitTest[];

    @Field((type) => [IOTest], opt)
    public ioTests?: ActionIOTest[];

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
