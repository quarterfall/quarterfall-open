import { OptionalField } from "graphql/helpers";
import { InputType } from "type-graphql";

@InputType()
export class GradingSchemeUpdateInput {
    @OptionalField((type) => String)
    public name?: string;

    @OptionalField((type) => String)
    public description?: string;

    @OptionalField((type) => String)
    public code?: string;

    @OptionalField()
    public isDefault?: boolean;
}
