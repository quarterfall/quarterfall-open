import GraphQLJSON from "graphql-type-json";
import { OptionalField } from "graphql/helpers";
import { Field, ID, ObjectType } from "type-graphql";

/** Optional field config */
const opt = { nullable: true };

@ObjectType()
export class Organization {
    @Field((type) => ID)
    public id: string;

    @Field()
    public createdAt: Date;

    @Field()
    public updatedAt: Date;

    @Field()
    public name: string;

    @Field()
    public country: string;

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
    public secondaryColor?: string;

    @Field((type) => GraphQLJSON, opt)
    public metadata: any;

    @OptionalField()
    public ssoProvider?: string;

    @OptionalField((type) => [String])
    public emailDomainNames?: string[];
}
