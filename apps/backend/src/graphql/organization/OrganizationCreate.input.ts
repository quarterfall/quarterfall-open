import { OptionalField } from "graphql/helpers";
import { Field, InputType } from "type-graphql";

@InputType()
export class OrganizationCreateInput {
    @Field()
    public name: string;

    @Field()
    public emailAddress: string;

    @OptionalField()
    public ssoProvider?: string;

    @OptionalField((type) => [String])
    public emailDomainNames?: string[];
}
