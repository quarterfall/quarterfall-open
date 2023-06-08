import { EventType } from "core";
import GraphQLJSON from "graphql-type-json";
import { Field, ID, ObjectType } from "type-graphql";

/** Optional field config */
const opt = { nullable: true };

@ObjectType()
export class Event {
    @Field((type) => ID)
    id: string;

    @Field()
    createdAt: Date;

    @Field(opt)
    organizationId?: string;

    @Field((type) => [String])
    subjects: string[];

    @Field((type) => String)
    type: EventType;

    @Field((type) => GraphQLJSON)
    data: any;

    @Field((type) => GraphQLJSON, opt)
    public metadata?: any;
}
