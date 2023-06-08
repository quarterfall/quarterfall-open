import { AnalyticsType } from "core";
import { OptionalField } from "graphql/helpers";
import { InputType } from "type-graphql";
import { AnalyticsBlockUpdateInput } from "./AnalyticsBlockUpdate.input";

@InputType()
export class AnalyticsBlockPresetUpdateInput extends AnalyticsBlockUpdateInput {
    @OptionalField((type) => AnalyticsType)
    public type?: AnalyticsType;

    @OptionalField()
    public published?: boolean;

    @OptionalField()
    public presetName?: string;
}
