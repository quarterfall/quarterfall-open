import { IOrganization } from "db/Organization";
import { Field, Int, ObjectType } from "type-graphql";
import { Organization } from "./Organization";

@ObjectType()
export class OrganizationSearchResult {
    @Field((type) => [Organization])
    public items: IOrganization[];

    @Field((type) => Int)
    public total: number;
}
