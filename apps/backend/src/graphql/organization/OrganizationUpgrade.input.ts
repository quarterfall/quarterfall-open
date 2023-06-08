import { OptionalField } from "graphql/helpers";
import { InputType } from "type-graphql";

const opt = { nullable: true };

@InputType()
export class OrganizationUpgradeInput {
    @OptionalField()
    public orderComment?: string;

    @OptionalField()
    public billingName?: string;

    @OptionalField()
    public billingPhoneNumber?: string;

    @OptionalField()
    public billingEmailAddress?: string;

    @OptionalField()
    public billingAddressLine1?: string;

    @OptionalField()
    public billingAddressLine2?: string;

    @OptionalField()
    public billingPostalCode?: string;

    @OptionalField()
    public billingCity?: string;

    @OptionalField()
    public billingCountryCode?: string;
}
