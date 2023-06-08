import { ApolloError } from "apollo-server-express";
import { config } from "config";
import { IUser } from "db/User";
import { log } from "Logger";
import { Types } from "mongoose";
import * as path from "path";
import { RequestContext } from "RequestContext";
import {
    Arg,
    Authorized,
    Ctx,
    FieldResolver,
    Mutation,
    Resolver,
    Root,
} from "type-graphql";
import { inspect } from "util";
import { deleteFiles, uploadFileFromStream } from "../../Storage";
import { generateImageName, generateResizedImage } from "../../Thumbnail";
import { FileInput } from "../file/File.input";
import { User } from "./User";

const avatarImageSizes = {
    large: {
        width: 200,
        height: 200,
    },
    small: {
        width: 40,
        height: 40,
    },
};

const opt = { nullable: true };

@Resolver(User)
export class UserImageResolver {
    //
    // Mutations
    //

    // uploads the user's avatar image
    @Authorized()
    @Mutation((returns) => User)
    public async uploadUserAvatarImage(
        @Arg("input", (type) => FileInput) input: FileInput,
        @Ctx() context: RequestContext
    ) {
        const { file, cropX, cropY, cropWidth, cropHeight } = input;
        const { user } = context;

        // create the file path
        const filePath = `user/${user?.id}`;

        // delete the old image if there is one
        if (user?.avatar) {
            const prefix = `${filePath}/${user.avatar.label}`;

            // delete the files in storage
            await deleteFiles(prefix);

            user.avatar = undefined;
            await user.save();
        }

        const { createReadStream, filename, mimetype } = await file;

        // construct the name to be used in storage
        const fileId = new Types.ObjectId();
        const name = `${filePath}/${fileId}`;
        const parsedPath = path.parse(filename);
        const extension = parsedPath.ext;

        // upload the original image
        const stream = createReadStream();

        // stream error handling
        stream.on("error", (error) => {
            throw new ApolloError(
                `An error occurred while uploading the image.`
            );
        });

        await uploadFileFromStream({
            stream,
            name: `${name}${extension}`,
            mimetype,
            overwrite: true,
        });

        // generate the resized images
        const baseOptions = {
            name,
            extension,
            cropX,
            cropY,
            cropHeight,
            cropWidth,
            format: "jpeg",
        };
        await generateResizedImage(
            Object.assign({}, baseOptions, avatarImageSizes.large) as any
        );
        await generateResizedImage(
            Object.assign({}, baseOptions, avatarImageSizes.small) as any
        );

        // update avatar image in the database and return the
        // updated user
        return user
            ?.set("avatar", {
                _id: fileId,
                label: filename,
                path: filePath,
                extension,
                mimetype,
                cropX,
                cropY,
                cropHeight,
                cropWidth,
            })
            .save();
    }

    // deletes the user's avatar image
    @Authorized()
    @Mutation((returns) => User)
    public async deleteUserAvatarImage(@Ctx() context: RequestContext) {
        const { user } = context;

        if (!user?.avatar) {
            // don't do anything since there is no avatar image
            return;
        }

        // construct the prefix of the files to be deleted from storage
        const prefix = `${user.avatar.path}/${user.avatar.id}`;

        // delete the files in storage
        try {
            await deleteFiles(prefix);
        } catch (error) {
            log.error("[deleteUserAvatarImage] " + inspect(error));
        }

        // update the user avatar image
        user.avatar = undefined;
        await user.save();

        // return the user
        return user;
    }

    //
    // Fields
    //

    @FieldResolver((returns) => String, opt)
    public avatarImageOriginal(@Root() { id, avatar }: IUser): string | null {
        if (!avatar) {
            return null;
        }
        return `https://${config.storage.bucket}/${avatar.path}/${avatar.id}${avatar.extension}`;
    }

    @FieldResolver((returns) => String, opt)
    public avatarImageLarge(@Root() { id, avatar }: IUser): string | null {
        if (!avatar) {
            return null;
        }
        const fileName = generateImageName(
            avatar.id,
            avatarImageSizes.large.width,
            avatarImageSizes.large.height
        );
        return `https://${config.storage.bucket}/${avatar.path}/${fileName}`;
    }

    @FieldResolver((returns) => String, opt)
    public avatarImageSmall(@Root() { id, avatar }: IUser): string | null {
        if (!avatar) {
            return null;
        }
        const fileName = generateImageName(
            avatar.id,
            avatarImageSizes.small.width,
            avatarImageSizes.small.height
        );
        return `https://${config.storage.bucket}/${avatar.path}/${fileName}`;
    }
}
