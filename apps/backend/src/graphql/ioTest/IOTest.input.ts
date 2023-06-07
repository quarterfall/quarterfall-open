import { OptionalField } from "graphql/helpers";
import { InputType } from "type-graphql";

@InputType()
export class IOTestInput {
    @OptionalField()
    public name?: string;

    @OptionalField()
    public description?: string;

    @OptionalField()
    public input?: string;

    @OptionalField()
    public output?: string;

    @OptionalField()
    public comparisonCode?: string;
}
