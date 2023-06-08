import { NotificationType } from "core";
import GraphQLJSON from "graphql-type-json";
import { Field, ID, ObjectType } from "type-graphql";

const opt = { nullable: true };

@ObjectType()
export class Notification {
    @Field((type) => ID)
    public id: string;

    @Field()
    public createdAt: Date;

    @Field()
    public updatedAt: Date;

    @Field((type) => String)
    public type: NotificationType;

    @Field(opt)
    public read: boolean;

    @Field(opt)
    public hidden: boolean;

    @Field((type) => String, opt)
    public text?: string;

    @Field((type) => String, opt)
    public link?: string;

    @Field((type) => GraphQLJSON, opt)
    public metadata: any;
}
