import { OptionalField } from "graphql/helpers";
import { ObjectType } from "type-graphql";

@ObjectType()
export class TestGradingSchemeResult {
    @OptionalField((type) => String)
    public result?: string;

    @OptionalField((type) => Number)
    public code?: number;

    @OptionalField((type) => [String])
    public log?: string[];
}
