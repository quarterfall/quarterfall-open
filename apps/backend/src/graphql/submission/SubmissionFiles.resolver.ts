import { ApolloError } from "apollo-server-express";
import { Permission, ServerError } from "core";
import { assignmentImageSizes, DBAssignment, IAssignment } from "db/Assignment";
import { DBBlock, IBlock } from "db/Block";
import { DBCourse, ICourse } from "db/Course";
import { DBModule } from "db/Module";
import { DBSubmission } from "db/Submission";
import { Block } from "graphql/block/Block";
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
import { Submission } from "./Submission";

const opt = { nullable: true };

@Resolver(Submission)
export class SubmissionFilesResolver {
    //
    // Mutations
    //

    // uploads an submission file
    @Authorized()
    @Mutation((returns) => Block)
    public async uploadSubmissionFile(
        @Ctx() context: RequestContext,
        @Arg("blockId", (type) => ID) blockId: string,
        @Arg("input", (type) => FileInput) input: FileInput
    ) {
        // retrieve the block
        const block = await context.loadById(DBBlock, blockId);

        // if the block doesn't exist, throw an error.
        if (!block) {
            throw new ApolloError(
                `Block with id ${blockId} not found.`,
                ServerError.NotFound
            );
        }

        const course = await this.retrieveCourseFromBlock(context, block);

        // check that the logged in user is allowed to create submissions in this course

        if (
            !(
                context.can(Permission.doAssignment, course) ||
                context.can(Permission.testAssignment, course)
            )
        ) {
            throw new UnauthorizedError();
        }

        if (course?.archived) {
            throw new UnauthorizedError();
        }

        // retrieve the submission or create if needed
        const submission = await DBSubmission.findOne({
            assignmentId: block.assignmentId,
            userId: context.user?._id,
        });

        if (!submission || submission.submittedDate) {
            throw new UnauthorizedError();
        }

        const { file, cropX, cropY, cropWidth, cropHeight } = input;
        const { createReadStream, mimetype, filename } = await file;

        // remove the filename extension and all not allowed characters
        const parsedPath = path.parse(filename);
        const label = parsedPath.name.replace(/[^a-z0-9-_]/gi, "");
        const extension = parsedPath.ext;

        // construct the name to be used in storage
        const fileId = new Types.ObjectId();

        //construct a path
        const filePath = `submission/${submission.id}/files`;
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
            `Uploading file "${name}${extension}" to storage for submission "${submission.id}".`
        );

        await uploadFileFromStream({
            stream,
            name: `${name}${extension}`,
            mimetype,
            overwrite: true,
        });

        log.debug(
            `Successfully uploaded file "${name}${extension}" to storage for submission "${submission.id}. Generating thumbnail images...`
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
            `Thumbnail images generated for file "${name}${extension}" (submission "${submission.id}). Updating submission document.`
        );

        const blockAnswers = submission.answers?.find((a) =>
            a.blockId.equals(blockId)
        );

        const blockFile = {
            _id: fileId,
            label,
            path: filePath,
            mimetype,
            extension,
            cropX,
            cropY,
            cropHeight,
            cropWidth,
        } as any;

        if (!blockAnswers) {
            submission.answers?.push({
                blockId: block._id,
                data: [""],
                files: [blockFile],
            });
        } else {
            blockAnswers.files = blockAnswers.files || [];
            blockAnswers.files?.push(blockFile);
        }

        await submission.save();

        log.notice(
            `Successfully uploaded file "${name}${extension}" (${fileId} for submission "${submission.id}".`
        );

        // return the updated submission
        return block;
    }

    // updates an submission file
    @Authorized()
    @Mutation((returns) => Block)
    public async updateSubmissionFile(
        @Ctx() context: RequestContext,
        @Arg("blockId", (type) => ID) blockId: string,
        @Arg("fileId", (type) => ID) fileId: string,
        @Arg("input", (type) => FileUpdateInput)
        input: FileUpdateInput
    ) {
        // retrieve the block
        const block = await context.loadById(DBBlock, blockId);

        // if the block doesn't exist, throw an error.
        if (!block) {
            throw new ApolloError(
                `Block with id ${blockId} not found.`,
                ServerError.NotFound
            );
        }

        const course = await this.retrieveCourseFromBlock(context, block);

        // check that the logged in user is allowed to create submissions in this course

        if (
            !(
                context.can(Permission.doAssignment, course) ||
                context.can(Permission.testAssignment, course)
            )
        ) {
            throw new UnauthorizedError();
        }

        if (course?.archived) {
            throw new UnauthorizedError();
        }

        const submission = await DBSubmission.findOne({
            assignmentId: block.assignmentId,
            userId: context.user?._id,
        });

        if (!submission) {
            throw new UnauthorizedError();
        }

        const blockAnswers = submission.answers.find((a) =>
            a.blockId.equals(blockId)
        );

        if (!blockAnswers || !blockAnswers?.files) {
            throw new UnauthorizedError();
        }

        // update the file label
        const file = (blockAnswers.files || []).find((f) => f.id === fileId);
        if (file) {
            Object.assign(file, input);
            await submission.save();
            log.debug(
                `Submission file ${file.id} of submission "${submission.id}" updated.`,
                input
            );
        }

        // return the updated assignment
        return block;
    }

    // deletes an submission file
    @Authorized()
    @Mutation((returns) => Block)
    public async deleteSubmissionFile(
        @Ctx() context: RequestContext,
        @Arg("blockId", (type) => ID) blockId: string,
        @Arg("fileId", (type) => ID) fileId: string
    ) {
        // retrieve the block
        const block = await context.loadById(DBBlock, blockId);

        // if the block doesn't exist, throw an error.
        if (!block) {
            throw new ApolloError(
                `Block with id ${blockId} not found.`,
                ServerError.NotFound
            );
        }

        const course = await this.retrieveCourseFromBlock(context, block);

        // check that the logged in user is allowed to create submissions in this course

        if (
            !(
                context.can(Permission.doAssignment, course) ||
                context.can(Permission.testAssignment, course)
            )
        ) {
            throw new UnauthorizedError();
        }

        if (course?.archived) {
            throw new UnauthorizedError();
        }

        const submission = await DBSubmission.findOne({
            assignmentId: block.assignmentId,
            userId: context.user?._id,
        });

        if (!submission) {
            throw new UnauthorizedError();
        }

        // construct the prefix of the files to be deleted from storage
        const prefix = `submission/${submission.id}/files/${fileId}`;

        log.debug(
            `Deleting file ${fileId} of submission "${submission.id}" from storage.`
        );

        // delete the files in storage
        try {
            await deleteFiles(prefix);
        } catch (error) {
            log.error("[deleteSubmissionImage] " + inspect(error));
        }

        log.debug(
            `Deleting file ${fileId} from submission document "${submission.id}".`
        );

        let blockAnswers = submission.answers.find((a) =>
            a?.blockId.equals(blockId)
        );

        if (!blockAnswers) {
            throw new UnauthorizedError();
        }

        // remove the file from answers
        blockAnswers.files = (blockAnswers.files || []).filter(
            (file) => file.id !== fileId
        );
        await submission.save();

        log.notice(
            `File ${fileId} of submission "${submission.id}" successfully deleted.`
        );

        // return the updated submission
        return block;
    }

    private async retrieveCourseFromBlock(
        context: RequestContext,
        block?: IBlock | null
    ): Promise<ICourse | null> {
        if (!block) {
            return null;
        }

        const assignment = await context.loadById(
            DBAssignment,
            block.assignmentId
        );
        return this.retrieveCourseFromAssignment(context, assignment);
    }

    private async retrieveCourseFromAssignment(
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
