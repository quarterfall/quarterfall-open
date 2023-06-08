import { StickerType } from "core";
import GraphQLJSON from "graphql-type-json";
import { OptionalField } from "graphql/helpers";
import { Field, ID, Int, ObjectType } from "type-graphql";

/** Optional field config */
const opt = { nullable: true };

@ObjectType()
export class Submission {
    @Field((type) => ID)
    public id: string;

    @Field()
    public createdAt: Date;

    @Field()
    public updatedAt: Date;

    @OptionalField()
    public submittedDate?: Date;

    @OptionalField((type) => Int)
    public time?: number;

    @Field((type) => Int, opt)
    public rating?: number;

    @OptionalField((type) => String)
    public sticker?: StickerType;

    @OptionalField()
    public studentRatingDifficulty?: number;

    @OptionalField()
    public studentRatingUsefulness?: number;

    @OptionalField()
    public studentComment?: string;

    @OptionalField()
    public comment?: string;

    @OptionalField()
    public score?: number;

    @OptionalField()
    public grade?: string;

    @Field((type) => GraphQLJSON, opt)
    public metadata?: any;

    @OptionalField((type) => Boolean, opt)
    public isApproved?: boolean;
}
