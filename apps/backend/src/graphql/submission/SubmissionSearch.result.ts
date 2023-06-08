import { Field, Int, ObjectType } from "type-graphql";
import { Submission } from "./Submission";

@ObjectType()
export class SubmissionSearchResult {
    @Field(type => [Submission])
    public items: Submission[];

    @Field(type => Int)
    public total: number;
}
