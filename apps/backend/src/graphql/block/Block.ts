import { Max, Min } from "class-validator";
import {
    AssessmentMethod,
    BlockType,
    Choice as QuestionChoice,
    EditorType,
    ProgrammingLanguage,
} from "core";
import GraphQLJSON from "graphql-type-json";
import { Field, ID, Int, ObjectType } from "type-graphql";
import { Choice } from "./Choice";

/** Optional field config */
const opt = { nullable: true };

@ObjectType()
export class Block {
    @Field((type) => ID)
    public id: string;

    @Field()
    public createdAt: Date;

    @Field()
    public updatedAt: Date;

    @Field(opt)
    public title?: string;

    @Field(opt)
    public text?: string;

    @Field(opt)
    public videoLink?: string;

    @Field((type) => String)
    public type: BlockType;

    @Field((type) => Int, opt)
    public index: number;

    @Field((type) => String, opt)
    public programmingLanguage?: ProgrammingLanguage;

    @Field((type) => String, opt)
    public editor?: EditorType;

    @Field((type) => [Choice], opt)
    public choices?: QuestionChoice[];

    @Field(opt)
    public multipleCorrect?: boolean;

    @Field(opt)
    public solution?: string;

    @Field(opt)
    public template?: string;

    @Field((type) => GraphQLJSON, opt)
    public metadata?: any;

    @Field((type) => Number, opt)
    @Min(1)
    @Max(10)
    public weight? = 1;

    @Field((type) => Number, opt)
    @Min(1)
    @Max(100)
    public granularity? = 100;

    @Field(opt)
    public hasRangeLimit?: boolean;

    @Field(opt)
    public criteriaText?: string;

    @Field((type) => String, opt)
    public assessmentMethod?: AssessmentMethod;

    @Field(opt)
    public allowedFileExtensions?: string;
}
