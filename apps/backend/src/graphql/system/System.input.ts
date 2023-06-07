import { OptionalField } from "graphql/helpers";
import { Field, InputType } from "type-graphql";

@InputType()
export class SystemInput {
    @Field()
    public errorName: string;

    @Field()
    public errorMessage: string;

    @Field()
    public errorUrl: string;

    @OptionalField()
    public errorCause?: string;

    @OptionalField()
    public errorStack?: string;

    @OptionalField()
    public browserName?: string;

    @OptionalField()
    public browserVersion?: string;

    @OptionalField()
    public browserOS?: string;

    @OptionalField()
    public userId?: string;
}
