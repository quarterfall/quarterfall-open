import { StickerType } from "core";
import GraphQLJSON from "graphql-type-json";
import { OptionalField } from "graphql/helpers";
import { InputType, Int } from "type-graphql";
import { Submission } from "./Submission";

@InputType()
export class SubmissionUpdateInput implements Partial<Submission> {
    @OptionalField()
    public comment?: string;

    @OptionalField((type) => Int)
    public rating?: number;

    @OptionalField((type) => String)
    public sticker?: StickerType;

    @OptionalField((type) => GraphQLJSON)
    public metadata?: any;
}
