import { OptionalField } from "graphql/helpers";
import { InputType } from "type-graphql";

@InputType()
export class AssignmentUpdateReviewInput {
    @OptionalField()
    public studentRatingDifficulty?: number;

    @OptionalField()
    public studentRatingUsefulness?: number;

    @OptionalField()
    public studentComment?: string;
}
