import { FileUpload, GraphQLUpload } from "graphql-upload";
import { Field, InputType } from "type-graphql";

const opt = { nullable: true };

@InputType()
export class FileInput {
    @Field(type => GraphQLUpload)
    public file: Promise<FileUpload>;

    @Field(opt)
    public cropX?: number;

    @Field(opt)
    public cropY?: number;

    @Field(opt)
    public cropWidth?: number;

    @Field(opt)
    public cropHeight?: number;
}
