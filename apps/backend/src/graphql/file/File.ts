import { Field, ID, ObjectType } from "type-graphql";

/** Optional field config */
const opt = { nullable: true };

@ObjectType()
export class File {
    @Field(type => ID)
    public id: string;

    @Field()
    public createdAt: Date;

    @Field()
    public updatedAt: Date;

    @Field(type => String)
    public mimetype: string;

    @Field()
    public label?: string;

    @Field()
    public extension?: string;

    @Field(opt)
    public cropX?: number;

    @Field(opt)
    public cropY?: number;

    @Field(opt)
    public cropWidth?: number;

    @Field(opt)
    public cropHeight?: number;

    @Field()
    public url: string;

    @Field(opt)
    public thumbnail?: string;
}
