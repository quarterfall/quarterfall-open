import { ApolloError } from "apollo-server-express";
import { Permission, ServerError } from "core";
import { assignmentImageSizes, DBAssignment, IAssignment } from "db/Assignment";
import { DBCourse, ICourse } from "db/Course";
import { DBModule } from "db/Module";
import { FileUpdateInput } from "graphql/file/FileUpdate.input";
import { log } from "Logger";
import { Types } from "mongoose";
import * as path from "path";
import { RequestContext } from "RequestContext";
import {
    Arg,
    Authorized,
    Ctx,
    ID,
    Mutation,
    Resolver,
    UnauthorizedError,
} from "type-graphql";
import { inspect } from "util";
import { deleteFiles, uploadFileFromStream } from "../../Storage";
import { generateResizedImage } from "../../Thumbnail";
import { FileInput } from "../file/File.input";
import { Assignment } from "./Assignment";

const opt = { nullable: true };

@Resolver(Assignment)
export class AssignmentFilesResolver {
    //
    // Mutations
    //

    // uploads an assignment file
    @Authorized()
    @Mutation((returns) => Assignment)
    public async uploadAssignmentFile(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("input", (type) => FileInput) input: FileInput
    ) {
        const { file, cropX, cropY, cropWidth, cropHeight } = input;

        // retrieve the assignment
        const assignment = await context.loadById(DBAssignment, id);
        if (!assignment) {
            throw new ApolloError(
                `Assignment with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        const course = await this.retrieveCourse(context, assignment);

        // check that the logged in user is allowed to change this assignment
        if (!context.can(Permission.updateCourse, course) || course?.archived) {
            throw new UnauthorizedError();
        }

        const { createReadStream, mimetype, filename } = await file;

        // remove the filename extension and all not allowed characters
        const parsedPath = path.parse(filename);
        const label = parsedPath.name.replace(/[^a-z0-9-_]/gi, "");
        const extension = parsedPath.ext;

        // construct the name to be used in storage
        const fileId = new Types.ObjectId();

        //construct a path
        const filePath = `assignment/${assignment.id}/files`;
        const name = `${filePath}/${fileId}`;

        // upload the original image
        const stream = createReadStream();

        // stream error handling
        stream.on("error", (error) => {
            throw new ApolloError(
                `An error occurred while uploading the image.`
            );
        });

        log.debug(
            `Uploading file "${name}${extension}" to storage for assignment "${assignment.title}" (${assignment.id}).`
        );

        await uploadFileFromStream({
            stream,
            name: `${name}${extension}`,
            mimetype,
            overwrite: true,
        });

        log.debug(
            `Successfully uploaded file "${name}${extension}" to storage for assignment "${assignment.title}" (${assignment.id}). Generating thumbnail images...`
        );

        // generate a thumbnail image for images
        const isImage = mimetype.startsWith("image");
        const isSvg = mimetype.startsWith("image/svg");
        if (isImage && !isSvg) {
            await generateResizedImage(
                Object.assign({
                    name,
                    extension,
                    cropX,
                    cropY,
                    cropHeight,
                    cropWidth,
                    format: "jpeg",
                }) as any
            );
            await generateResizedImage(
                Object.assign(
                    {
                        name,
                        extension,
                        cropX,
                        cropY,
                        cropHeight,
                        cropWidth,
                        format: "jpeg",
                    },
                    assignmentImageSizes.thumbnail
                ) as any
            );
        }

        log.debug(
            `Thumbnail images generated for file "${name}${extension}" (assignment "${assignment.title}" - ${assignment.id}). Updating assignment document.`
        );

        // update assignment file in the database
        assignment.files = assignment.files || [];
        assignment.files.push({
            _id: fileId,
            label,
            path: filePath,
            mimetype,
            extension,
            cropX,
            cropY,
            cropHeight,
            cropWidth,
        } as any);
        await assignment.save();

        log.notice(
            `Successfully uploaded file "${name}${extension}" (${fileId} for assignment "${assignment.title}" (${assignment.id}).`
        );

        // return the updated assignment
        return assignment;
    }

    // updates an assignment file
    @Authorized()
    @Mutation((returns) => Assignment)
    public async updateAssignmentFile(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("fileId", (type) => ID) fileId: string,
        @Arg("input", (type) => FileUpdateInput) input: FileUpdateInput
    ) {
        // retrieve the assignment
        const assignment = await context.loadById(DBAssignment, id);
        if (!assignment) {
            throw new ApolloError(
                `Assignment with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        const course = await this.retrieveCourse(context, assignment);

        // check that the logged in user is allowed to change this assignment
        if (!context.can(Permission.updateCourse, course) || course?.archived) {
            throw new UnauthorizedError();
        }

        if (input.label) {
            input.label = input.label.replace(/[^a-z0-9-_]/gi, "");
        }

        // update the file label
        const file = (assignment.files || []).find((f) => f.id === fileId);
        if (file) {
            Object.assign(file, input);
            assignment.markModified("files");
            await assignment.save();
            log.debug(
                `Assignment file ${file.id} of assignment "${assignment.title}" (${assignment.id}) updated.`,
                input
            );
        }

        // return the updated assignment
        return assignment;
    }

    // deletes an assignment file
    @Authorized()
    @Mutation((returns) => Assignment)
    public async deleteAssignmentFile(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("fileId", (type) => ID) fileId: string
    ) {
        // retrieve the assignment
        const assignment = await context.loadById(DBAssignment, id);
        if (!assignment) {
            throw new ApolloError(
                `Assignment with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        const course = await this.retrieveCourse(context, assignment);

        // check that the logged in user is allowed to change this assignment
        if (!context.can(Permission.updateCourse, course) || course?.archived) {
            throw new UnauthorizedError();
        }

        // construct the prefix of the files to be deleted from storage
        const prefix = `assignment/${assignment.id}/files/${fileId}`;

        log.debug(
            `Deleting file ${fileId} of assignment "${assignment.title}" (${assignment.id}) from storage.`
        );

        // delete the files in storage
        try {
            await deleteFiles(prefix);
        } catch (error) {
            log.error("[deleteAssignmentImage] " + inspect(error));
        }

        log.debug(
            `Deleting file ${fileId} from assignment document "${assignment.title}" (${assignment.id}).`
        );

        // remove the image from the array
        assignment.files = (assignment.files || []).filter(
            (file) => file.id !== fileId
        );
        await assignment.save();

        log.notice(
            `File ${fileId} of assignment "${assignment.title}" (${assignment.id}) successfully deleted.`
        );

        // return the updated assignment
        return assignment;
    }

    private async retrieveCourse(
        context: RequestContext,
        assignment?: IAssignment | null
    ): Promise<ICourse | null> {
        if (!assignment) {
            return null;
        }

        const module = await context.loadById(DBModule, assignment.moduleId);
        return context.loadById(DBCourse, module?.courseId);
    }
}
