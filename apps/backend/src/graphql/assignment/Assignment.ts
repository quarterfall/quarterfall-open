import { AssessmentType } from "core";
import GraphQLJSON from "graphql-type-json";
import { File } from "graphql/file/File";
import { OptionalField } from "graphql/helpers";
import { Field, ID, Int, ObjectType } from "type-graphql";

@ObjectType()
export class Assignment {
    @Field((type) => ID)
    public id: string;

    @OptionalField((type) => ID)
    public publicKey?: string;

    @Field()
    public createdAt: Date;

    @Field()
    public updatedAt: Date;

    @Field()
    public title: string;

    @OptionalField((type) => ID)
    public shareCode?: string;

    @Field((type) => ID)
    public moduleId: string;

    @OptionalField((type) => Boolean)
    public hasIntroduction?: boolean;

    @OptionalField()
    public introduction?: string;

    @Field()
    public visible: boolean;

    @Field((type) => Int)
    public index: number;

    @OptionalField((type) => [String])
    public keywords?: string[];

    @OptionalField()
    public author?: string;

    @OptionalField()
    public remarks?: string;

    @OptionalField((type) => [File])
    public files?: File[];

    @OptionalField((type) => Number)
    public difficulty?: number;

    @OptionalField((type) => Boolean)
    public isOptional?: boolean;

    @OptionalField()
    public gradingSchemeName?: string;

    @OptionalField()
    public gradingSchemeDescription?: string;

    @OptionalField()
    public gradingSchemeCode?: string;

    @OptionalField((type) => Boolean)
    public forceBlockOrder?: boolean;

    @OptionalField((type) => GraphQLJSON)
    public metadata?: any;

    @OptionalField((type) => String)
    public assessmentType?: AssessmentType;
}
