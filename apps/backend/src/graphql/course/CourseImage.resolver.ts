import { ApolloError } from "apollo-server-express";
import { config } from "config";
import { defaultCourseImage, Permission } from "core";
import { DBCourse, ICourse } from "db/Course";
import { log } from "Logger";
import { Types } from "mongoose";
import * as path from "path";
import { RequestContext } from "RequestContext";
import {
    Arg,
    Authorized,
    Ctx,
    FieldResolver,
    ID,
    Mutation,
    Resolver,
    Root,
    UnauthorizedError,
} from "type-graphql";
import { inspect } from "util";
import { deleteFiles, uploadFileFromStream } from "../../Storage";
import { generateImageName, generateResizedImage } from "../../Thumbnail";
import { FileInput } from "../file/File.input";
import { Course } from "./Course";

const opt = { nullable: true };

const logoSizes = {
    default: {
        width: 560,
        height: 315,
    },
};

@Resolver(Course)
export class CourseImageResolver {
    //
    // Mutations
    //

    // upload the course image
    @Authorized()
    @Mutation((returns) => Course)
    public async uploadCourseImage(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("input", (type) => FileInput) input: FileInput
    ) {
        const { file, cropX, cropY, cropWidth, cropHeight } = input;

        // retrieve the course
        const course = await context.loadById(DBCourse, id);

        if (!course) {
            throw new ApolloError(`Course with id ${id} not found.`);
        }

        // check that the user has permission to update the course and that the course is not archived
        if (!context.can(Permission.updateCourse, course) || course.archived) {
            throw new UnauthorizedError();
        }

        //create file path
        const filePath = `course/${course.id}`;

        // delete the old image if there is one
        if (course.image) {
            const prefix = `${filePath}/${course.image.id}`;

            // delete the files in storage
            await deleteFiles(prefix);

            course.image = undefined;
            await course.save();
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
            format: "jpg",
        };
        await generateResizedImage(
            Object.assign({}, baseOptions, logoSizes.default) as any
        );

        // update image in the database
        course.set("image", {
            _id: fileId,
            label: filename,
            path: filePath,
            extension,
            mimetype,
            cropX,
            cropY,
            cropHeight,
            cropWidth,
        });
        course.selectedImage = "custom";
        await course.save();

        // return the updated course
        return course;
    }

    // deletes the course image
    @Authorized()
    @Mutation((returns) => Course)
    public async deleteCourseImage(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ) {
        // retrieve the course
        const course = await context.loadById(DBCourse, id);

        if (!course) {
            throw new ApolloError(`Course with id ${id} not found.`);
        }

        // check that the user has permission to update the course and that the course is not archived
        if (!context.can(Permission.updateCourse, course) || course.archived) {
            throw new UnauthorizedError();
        }

        if (!course.image) {
            // don't do anything since there is no image
            return;
        }

        // construct the prefix of the files to be deleted from storage
        const prefix = `${course.image.path}/${course.image.id}`;

        // delete the files in storage
        try {
            await deleteFiles(prefix);
        } catch (error) {
            log.error("[deleteCourseImage] " + inspect(error));
        }

        // update the cours image
        course.image = undefined;
        if (course.selectedImage === "custom") {
            course.selectedImage = defaultCourseImage;
        }
        await course.save();

        // return the course
        return course;
    }

    //
    // Fields
    //

    @FieldResolver((returns) => String, opt)
    public imageOriginal(@Root() { id, image }: ICourse): string | null {
        if (!image) {
            return null;
        }
        return `https://${config.storage.bucket}/${image.path}/${image.id}${image.extension}`;
    }

    @FieldResolver((returns) => String, opt)
    public image(@Root() { id, image, selectedImage }: ICourse): string | null {
        if (!image) {
            return null;
        }
        const fileName = generateImageName(
            image.id,
            logoSizes.default.width,
            logoSizes.default.height,
            "jpg"
        );
        return `https://${config.storage.bucket}/${image.path}/${fileName}`;
    }
}
