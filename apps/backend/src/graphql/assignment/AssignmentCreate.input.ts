import { AssessmentType } from "core";
import { OptionalField } from "graphql/helpers";
import { Field, InputType } from "type-graphql";
@InputType()
export class AssignmentCreateInput {
    @Field()
    public title: string;

    @OptionalField((type) => String)
    public assessmentType?: AssessmentType;

    @OptionalField((type) => Number)
    public difficulty?: number;
}
