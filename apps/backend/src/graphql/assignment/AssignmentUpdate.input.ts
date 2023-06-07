import { AssessmentType, PublicLicenseType } from "core";
import GraphQLJSON from "graphql-type-json";
import { OptionalField } from "graphql/helpers";
import { InputType } from "type-graphql";

@InputType()
export class AssignmentUpdateInput {
    @OptionalField()
    public title?: string;

    @OptionalField((type) => Boolean)
    public hasIntroduction?: boolean;

    @OptionalField()
    public introduction?: string;

    @OptionalField()
    public visible?: boolean;

    @OptionalField((type) => [String])
    public keywords?: string[];

    @OptionalField()
    public author?: string;

    @OptionalField()
    public remarks?: string;

    @OptionalField((type) => PublicLicenseType)
    public license?: PublicLicenseType;

    @OptionalField((type) => Number)
    public difficulty?: number;

    @OptionalField()
    public isOptional?: boolean;

    @OptionalField()
    public forceBlockOrder?: boolean;

    @OptionalField((type) => GraphQLJSON)
    public metadata?: any;

    @OptionalField((type) => String)
    public assessmentType?: AssessmentType;

    @OptionalField()
    public gradingSchemeName?: string;

    @OptionalField()
    public gradingSchemeDescription?: string;

    @OptionalField()
    public gradingSchemeCode?: string;
}
