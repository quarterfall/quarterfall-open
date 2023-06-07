import { Max, Min } from "class-validator";
import {
    AssessmentMethod,
    BlockType,
    Choice as QuestionChoice,
    EditorType,
    ProgrammingLanguage,
} from "core";
import GraphQLJSON from "graphql-type-json";
import { Field, InputType } from "type-graphql";
import { ChoiceInput } from "./Choice.input";

/** Optional field config */
const opt = { nullable: true };

@InputType()
export class BlockUpdateInput {
    @Field(opt)
    public title?: string;

    @Field(opt)
    public text?: string;

    @Field(opt)
    public videoLink?: string;

    @Field((type) => String, opt)
    public type?: BlockType;

    @Field((type) => String, opt)
    public editor?: EditorType;

    @Field((type) => [ChoiceInput], opt)
    public choices?: QuestionChoice[];

    @Field((type) => String, opt)
    public programmingLanguage?: ProgrammingLanguage;

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
    public weight?: number;

    @Field((type) => Number, opt)
    public granularity?: number;

    @Field(opt)
    public hasRangeLimit?: boolean;

    @Field(opt)
    public criteriaText?: string;

    @Field((type) => String, opt)
    public assessmentMethod?: AssessmentMethod;

    @Field(opt)
    public allowedFileExtensions?: string;
}
