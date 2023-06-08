import { config } from "config";
import { assignmentImageSizes } from "db/Assignment";
import { FieldResolver, Resolver, Root } from "type-graphql";
import { IFile } from "../../db/File";
import { generateImageName } from "../../Thumbnail";
import { File } from "./File";

const opt = { nullable: true };

@Resolver(File)
export class FileResolver {
    //
    // Fields
    //

    @FieldResolver((type) => String)
    public url(@Root() file: IFile): string {
        const isImage = file.mimetype.startsWith("image");
        const isSvg = file.mimetype.startsWith("image/svg");
        return isImage && !isSvg
            ? `https://${config.storage.bucket}/${
                  file.path
              }/${generateImageName(file.id, undefined, undefined)}`
            : `https://${config.storage.bucket}/${file.path}/${file.id}${file.extension}`;
    }

    @FieldResolver((type) => String, opt)
    public thumbnail(@Root() file: IFile): string | null {
        const isImage = file.mimetype.startsWith("image");
        const isSvg = file.mimetype.startsWith("image/svg");
        return isImage && !isSvg
            ? `https://${config.storage.bucket}/${
                  file.path
              }/${generateImageName(
                  file.id,
                  assignmentImageSizes.thumbnail.width,
                  assignmentImageSizes.thumbnail.height
              )}`
            : null;
    }
}
