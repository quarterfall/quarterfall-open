import GraphQLJSON from "graphql-type-json";
import { OptionalField } from "graphql/helpers";
import { InputType } from "type-graphql";
import { Organization } from "./Organization";

const opt = { nullable: true };

@InputType()
export class OrganizationUpdateInput implements Partial<Organization> {
    @OptionalField()
    public name?: string;

    @OptionalField()
    public country?: string;

    @OptionalField()
    public subdomain?: string;

    @OptionalField()
    public website?: string;

    @OptionalField()
    public archived?: boolean;

    @OptionalField()
    public allowAnonymousSubmissions?: boolean;

    @OptionalField()
    public appBarColor?: string;

    @OptionalField()
    public primaryColor?: string;

    @OptionalField()
    public secondaryColor: string;

    @OptionalField()
    public licenseRenewalDate?: Date;

    @OptionalField()
    public licenseRemark?: string;

    @OptionalField()
    public licenseTotalStudentCredits?: number;

    @OptionalField()
    public licenseUsedStudentCredits?: number;

    @OptionalField()
    public licenseEnforceRenewalDate?: boolean;

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

    @OptionalField()
    public billingVAT?: string;

    @OptionalField((type) => GraphQLJSON)
    public metadata?: any;

    @OptionalField()
    public ssoProvider?: string;

    @OptionalField((type) => [String])
    public emailDomainNames?: string[];
}
