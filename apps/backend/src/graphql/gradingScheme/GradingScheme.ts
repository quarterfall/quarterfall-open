import { OptionalField } from "graphql/helpers";
import { Field, ID, ObjectType } from "type-graphql";

/** Optional field config */
const opt = { nullable: true };

@ObjectType()
export class GradingScheme {
    @Field((type) => ID)
    public id: string;

    @Field((type) => String)
    public name: string;

    @OptionalField((type) => String, opt)
    public description?: string;

    @Field((type) => String)
    public code: string;

    @OptionalField((type) => Boolean, opt)
    public isDefault?: boolean;
}
