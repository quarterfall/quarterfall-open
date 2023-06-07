import { ApolloError } from "apollo-server-express";
import { config, submissionKeyString } from "config";
import {
    arrayMove,
    AssessmentMethod,
    BlockEventType,
    BlockType,
    ExitCode,
    Permission,
    RoleType,
    ServerError,
} from "core";
import { isAfter, min } from "date-fns";
import { DBAction } from "db/Action";
import { DBAssignment, IAssignment } from "db/Assignment";
import { DBBlock, IBlock } from "db/Block";
import { DBCourse, ICourse } from "db/Course";
import { DBModule } from "db/Module";
import { DBSubmission, ISubmission } from "db/Submission";
import { postEvent } from "event/Event";
import GraphQLJSON from "graphql-type-json";
import { Action } from "graphql/action/Action";
import { Assignment } from "graphql/assignment/Assignment";
import { File } from "graphql/file/File";
import { Submission } from "graphql/submission/Submission";
import { log } from "Logger";
import {
    copyBlock,
    deleteBlock,
    generateBlockIndices,
} from "operations/Block.operation";
import { computeBlockFeedback } from "operations/Feedback.operation";
import {
    computeAssignmentGrade,
    computeAssignmentScore,
} from "operations/Grading.operation";
import { RequestContext } from "RequestContext";
import { exchangeCode } from "Security";
import {
    Arg,
    Authorized,
    Ctx,
    FieldResolver,
    ID,
    Int,
    Mutation,
    Query,
    Resolver,
    Root,
    UnauthorizedError,
} from "type-graphql";
import { Block } from "./Block";
import { BlockAddInput } from "./BlockAdd.input";
import { BlockUpdateInput } from "./BlockUpdate.input";
import Feedback from "./Feedback";

const opt = { nullable: true };
@Resolver(Block)
export class BlockResolver {
    @Query((returns) => Block)
    public async block(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ): Promise<IBlock | null> {
        // retrieve the block
        const block = await context.loadById(DBBlock, id);
        if (!block) {
            throw new ApolloError(
                `Block with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        const course = await this.retrieveCourseFromBlock(context, block);

        // check that the logged in user is allowed to read this block
        if (!context.can(Permission.readCourse, course)) {
            throw new UnauthorizedError();
        }

        return block;
    }

    @Authorized()
    @Mutation((returns) => Assignment)
    public async addBlock(
        @Ctx() context: RequestContext,
        @Arg("assignmentId", (type) => ID) assignmentId: string,
        @Arg("input") input: BlockAddInput,
        @Arg("beforeIndex", (type) => Int, opt) beforeIndex?: number
    ) {
        // retrieve the assignment and the course
        const assignment = await context.loadById(DBAssignment, assignmentId);
        if (!assignment) {
            throw new ApolloError(
                `Assignment with id ${assignmentId} not found.`,
                ServerError.NotFound
            );
        }

        const course = await this.retrieveCourseFromAssignment(
            context,
            assignment
        );

        // check that the logged in user is allowed to change this assignment
        if (!context.can(Permission.updateCourse, course) || course?.archived) {
            throw new UnauthorizedError();
        }

        // determine the index to store with the assignment
        const index =
            beforeIndex !== undefined
                ? beforeIndex - 0.5
                : Number.MAX_SAFE_INTEGER;

        let extraInput: any;

        if (assignment?.assessmentType) {
            extraInput = {
                assessmentMethod:
                    input.type === BlockType.MultipleChoiceQuestion
                        ? AssessmentMethod["correctAnswer"]
                        : undefined,
                weight: 1,
                granularity: 1,
                hasRangeLimit: true,
                criteriaText: "",
            };
        }
        // create the block
        const block = await new DBBlock(
            Object.assign({ assignmentId, index }, input, extraInput)
        ).save();

        // regenerate the indices for all the blocks in the assignment
        await generateBlockIndices(assignmentId);

        postEvent({
            type: BlockEventType.BlockCreated,
            organizationId: context?.organization?.id,
            subjects: [course?.id],
            data: {
                assignment: {
                    id: assignment?.id,
                    title: assignment?.title,
                },
                question: {
                    id: block.id,
                    title: block.title,
                    index: block.index,
                },
                course: {
                    id: course?.id,
                    title: course?.title,
                    description: course?.description,
                },
                user: {
                    id: context?.user?.id,
                    firstName: context?.user?.firstName,
                    lastName: context?.user?.lastName,
                    emailAddress: context?.user?.emailAddress,
                },
            },
            metadata: {
                link: `/assignment/${assignment?.id}/questions/${block.id}`,
            },
        });

        log.notice(
            `Block with id ${block.id} added to assignment "${assignment.title}" (${assignment.id}).`
        );

        // return the assignment
        return assignment;
    }

    @Authorized()
    @Mutation((returns) => Assignment)
    public async copyBlock(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("assignmentId", (type) => ID, opt) assignmentId?: string,
        @Arg("keepIndex", (type) => Boolean, opt) keepIndex?: boolean
    ) {
        const block = await context.loadById(DBBlock, id);

        // if the block doesn't exist, throw an error.
        if (!block) {
            throw new ApolloError(
                `Block with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        // retrieve the associated assignment
        const assignment = await context.loadById(
            DBAssignment,
            assignmentId || block.assignmentId
        );
        if (!assignment) {
            throw new ApolloError(
                `Assignment with id ${
                    assignmentId || block.assignmentId
                } not found.`,
                ServerError.NotFound
            );
        }

        const course = await this.retrieveCourseFromAssignment(
            context,
            assignment
        );

        // check that the logged in user is allowed to change this assignment
        if (!context.can(Permission.updateCourse, course) || course?.archived) {
            throw new UnauthorizedError();
        }

        // make a copy of the block
        const blockCopy = await copyBlock(block, assignment._id, keepIndex);

        log.notice(
            `Block with id ${block.id} copied (id of the copy: ${blockCopy?.id}) to assignment "${assignment.title}" (${assignment.id}).`
        );

        // return the assignment
        return assignment;
    }

    @Authorized()
    @Mutation((returns) => Block)
    public async updateBlock(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("input") input: BlockUpdateInput
    ) {
        // retrieve the block
        const block = await context.loadById(DBBlock, id);
        if (!block) {
            throw new ApolloError(
                `Block with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        const assignment = await DBAssignment.findById(block.assignmentId);

        const course = await this.retrieveCourseFromBlock(context, block);

        // check that the logged in user is allowed to change this assignment
        if (!context.can(Permission.updateCourse, course) || course?.archived) {
            throw new UnauthorizedError();
        }

        // set the input
        block.set(input);

        if (
            input.type === BlockType.MultipleChoiceQuestion &&
            assignment?.assessmentType
        ) {
            block.assessmentMethod = AssessmentMethod.correctAnswer;
        }

        //reset correct,missing and wrong scores when assessment method changes.
        if (input.assessmentMethod) {
            for (const choice of block.choices || []) {
                if (!choice) {
                    continue;
                }
                choice.correctScore = 100;
                choice.wrongScore = 0;
                block.markModified("choices");
            }
        }

        // fix multiple correct issues if there are any
        if (!block.multipleCorrect) {
            let correctAnswerFound = false;
            // make sure there is only a single correct answer
            for (const choice of block.choices || []) {
                if (!choice.correct) {
                    continue;
                }
                if (correctAnswerFound) {
                    choice.correct = false;
                    block.markModified("choices");
                } else {
                    correctAnswerFound = true;
                }
            }
            // if there is no correct answer yet, simply choose the first one
            if (!correctAnswerFound && block.choices?.length > 0) {
                block.choices[0].correct = true;
                block.markModified("choices");
            }
        }

        postEvent({
            type: BlockEventType.BlockUpdated,
            organizationId: context?.organization?.id,
            subjects: [course?.id],
            data: {
                assignment: {
                    id: assignment?.id,
                    title: assignment?.title,
                },
                question: {
                    id: block.id,
                    title: block.title,
                    index: block.index,
                },
                course: {
                    id: course?.id,
                    title: course?.title,
                    description: course?.description,
                },
                user: {
                    id: context?.user?.id,
                    firstName: context?.user?.firstName,
                    lastName: context?.user?.lastName,
                    emailAddress: context?.user?.emailAddress,
                },
            },
            metadata: {
                link: `/assignment/${assignment?.id}/questions/${block.id}`,
            },
        });

        log.notice(`Block with id ${block.id} updated.`, input);

        // return the block
        return block.save();
    }

    @Authorized()
    @Mutation((returns) => Assignment)
    public async deleteBlock(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ) {
        // retrieve the block
        const block = await context.loadById(DBBlock, id);

        // if the block doesn't exist, throw an error.
        if (!block) {
            throw new ApolloError(
                `Block with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        const assignment = await DBAssignment.findById(block.assignmentId);

        const course = await this.retrieveCourseFromBlock(context, block);

        // check that the logged in user is allowed to change this assignment
        if (!context.can(Permission.updateCourse, course) || course?.archived) {
            throw new UnauthorizedError();
        }

        // delete the block
        await deleteBlock(block);

        postEvent({
            type: BlockEventType.BlockDeleted,
            organizationId: context?.organization?.id,
            subjects: [course?.id],
            data: {
                assignment: {
                    id: assignment?.id,
                    title: assignment?.title,
                },
                question: {
                    id: block.id,
                    title: block.title,
                    index: block.index,
                },
                course: {
                    id: course?.id,
                    title: course?.title,
                    description: course?.description,
                },
                user: {
                    id: context?.user?.id,
                    firstName: context?.user?.firstName,
                    lastName: context?.user?.lastName,
                    emailAddress: context?.user?.emailAddress,
                },
            },
            metadata: {
                link: `/assignment/${assignment?.id}`,
            },
        });

        log.notice(`Block with id ${block.id} deleted.`, block.toJSON());

        // return the assignment
        return context.loadById(DBAssignment, block.assignmentId);
    }

    @Authorized()
    @Mutation((returns) => Assignment)
    public async moveBlockToIndex(
        @Ctx() context: RequestContext,
        @Arg("index", (type) => Int) index: number,
        @Arg("id", (type) => ID) id: string
    ): Promise<IAssignment | null> {
        // retrieve the block
        const block = await context.loadById(DBBlock, id);

        // if the block doesn't exist, throw an error.
        if (!block) {
            throw new ApolloError(
                `Block with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        // retrieve the assignment
        const assignment = await context.loadById(
            DBAssignment,
            block.assignmentId
        );
        if (!assignment) {
            throw new ApolloError(
                `Assignment with id ${block.assignmentId} not found.`,
                ServerError.NotFound
            );
        }

        const course = await this.retrieveCourseFromAssignment(
            context,
            assignment
        );

        // check that the logged in user is allowed to change this assignment
        if (!context.can(Permission.updateCourse, course) || course?.archived) {
            throw new UnauthorizedError();
        }

        // retrieve all the blocks and sort them by index
        const blocks = await DBBlock.find({
            assignmentId: block.assignmentId,
        }).sort("index");

        // check that the old index is valid
        const oldIndex = blocks.findIndex((value) =>
            value._id.equals(block._id)
        );
        if (oldIndex < 0 || oldIndex >= blocks.length) {
            throw new ApolloError(`Invalid existing block index ${oldIndex}.`);
        }

        // move the block
        arrayMove({
            array: blocks,
            oldIndex,
            newIndex: index,
            newArray: blocks,
        });

        // update the block indices
        await Promise.all(
            blocks.map(async (e, i) => {
                e.index = i;
                await e.save();
            })
        );

        log.notice(`Block with id ${block.id} moved to index ${index}.`);

        return assignment;
    }

    @Authorized()
    @Mutation((returns) => Feedback, opt)
    public async computeFeedbackPreview(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("answer", (type) => [String]) input: string[],
        @Arg("languageData", (type) => GraphQLJSON, opt) languageData?: any
    ): Promise<Feedback | null> {
        // retrieve the block
        const block = await context.loadById(DBBlock, id);

        // if the block doesn't exist, throw an error.
        if (!block) {
            throw new ApolloError(
                `Block with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        // retrieve the assignment
        const assignment = await context.loadById(
            DBAssignment,
            block.assignmentId
        );
        if (!assignment) {
            throw new ApolloError(
                `Assignment with id ${block.assignmentId} not found.`,
                ServerError.NotFound
            );
        }

        const course = await this.retrieveCourseFromAssignment(
            context,
            assignment
        );

        // preview can be done for all courses, except for archived courses
        if (course?.archived) {
            throw new UnauthorizedError();
        }

        let actions = await DBAction.find({ blockId: block?._id });
        actions = (actions || []).sort(
            (a, b) =>
                block?.actions?.indexOf(a._id) - block?.actions?.indexOf(b._id)
        );

        // generate the feedback
        const feedback = await computeBlockFeedback({
            assignment,
            block,
            actions,
            input,
            user: context.user,
            languageData,
        });

        log.debug(`Created preview feedback for block with id ${block.id}.`);

        // return the feedback
        return feedback;
    }

    @Authorized()
    @Mutation((returns) => Submission)
    public async updateTeacherAssessment(
        @Ctx() context: RequestContext,
        @Arg("blockId", (type) => ID) blockId: string,
        @Arg("submissionId", (type) => ID) submissionId: string,
        @Arg("score", (type) => Number, opt) score?: number,
        @Arg("justificationText", (type) => String, opt)
        justificationText?: string
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

        // check that the logged in user is allowed to update submissions in this course
        if (
            !context.can(Permission.updateSubmission, course) ||
            course?.archived
        ) {
            throw new UnauthorizedError();
        }

        // retrieve the submission or create if needed
        const submission = await DBSubmission.findById(submissionId);

        if (!submission) {
            throw new ApolloError(
                `Submission with id ${submissionId} not found.`,
                ServerError.NotFound
            );
        }

        const assignment = await this.retrieveAssignmentFromBlock(
            context,
            block
        );
        if (!assignment) {
            throw new ApolloError(
                `Assignment not found.`,
                ServerError.NotFound
            );
        }

        const blockAssessment = submission?.feedback?.find((a) =>
            a.blockId.equals(block._id)
        );

        const overrideFeedback = {
            text: [],
            log: [],
            code: ExitCode.NoError,
            blockId: block._id,
            score: score || 0,
            originalScore: blockAssessment?.originalScore || null,
            justificationText: justificationText || "",
            attemptCount: 1,
        };
        // update the teacher assessment for this block in the submission
        if (!blockAssessment) {
            submission.feedback.push(overrideFeedback);
        } else {
            if (!blockAssessment.originalScore) {
                blockAssessment.originalScore = blockAssessment.score;
            }
            if (score !== undefined && score !== null) {
                blockAssessment.score = score || 0;
            }
            if (justificationText !== undefined) {
                blockAssessment.justificationText = justificationText || "";
            }
        }

        log.debug(
            `Submission with id ${submission.id} score and grade is recalculated.`
        );
        submission.score = await computeAssignmentScore(submission, assignment);
        submission.grade = await computeAssignmentGrade(submission, assignment);

        log.debug(
            `Submission with id ${submission.id} teacher assessment is updated.`
        );

        // return the assignment for caching
        return submission.save();
    }

    @Mutation((returns) => Block)
    public async updateAnswer(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("data", (type) => [String]) data: string[],
        @Arg("publicKey", (type) => String, opt) publicKey?: string
    ): Promise<IBlock> {
        // retrieve the block
        const block = await context.loadById(DBBlock, id);

        // if the block doesn't exist, throw an error.
        if (!block) {
            throw new ApolloError(
                `Block with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        const assignment = await this.retrieveAssignmentFromBlock(
            context,
            block
        );

        if (!assignment) {
            throw new UnauthorizedError();
        }

        const course = await this.retrieveCourseFromAssignment(
            context,
            assignment
        );

        // check that the logged in user is allowed to create submissions in this course
        if (
            context.user?._id &&
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

        let submission: ISubmission | null;
        if (publicKey) {
            submission = await DBSubmission.findById(
                this.exchangeSubmissionKey(context, publicKey)
            );
        } else {
            submission = await DBSubmission.findOne({
                userId: context.user?.id,
                assignmentId: assignment.id,
            });
        }

        if (!submission) {
            throw new UnauthorizedError();
        }

        if (submission.submittedDate) {
            throw new UnauthorizedError();
        }

        if (!assignment._id.equals(submission?.assignmentId)) {
            throw new UnauthorizedError();
        }

        // update the answers for this block in the submission
        const blockAnswers = submission.answers?.find((a) =>
            a.blockId.equals(block._id)
        );
        if (!blockAnswers) {
            submission.answers.push({
                blockId: block._id,
                data,
            });
        } else {
            blockAnswers.data = data;
        }

        // add an activity timestamp
        submission.studentActivityTimestamps = (
            submission.studentActivityTimestamps || []
        ).concat(Date.now());

        log.debug(
            `Submission with id ${submission.id} answers were updated.`,
            data
        );

        // save the changes
        await submission.save();

        // return the block
        return block;
    }

    @Mutation((returns) => Block)
    public async computeFeedback(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("languageData", (type) => GraphQLJSON, opt) languageData?: any,
        @Arg("publicKey", (type) => String, opt) publicKey?: string
    ): Promise<IBlock> {
        // retrieve the block
        const block = await context.loadById(DBBlock, id);

        // if the block doesn't exist, throw an error.
        if (!block) {
            throw new ApolloError(
                `Block with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        const assignment = await this.retrieveAssignmentFromBlock(
            context,
            block
        );

        if (!assignment) {
            throw new UnauthorizedError();
        }
        const course = await this.retrieveCourseFromAssignment(
            context,
            assignment
        );

        // check that the logged in user is allowed to create submissions in this course

        if (
            context.user?._id &&
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

        let actions = await DBAction.find({ blockId: block?._id });
        actions = (actions || []).sort(
            (a, b) =>
                block?.actions?.indexOf(a._id) - block?.actions?.indexOf(b._id)
        );

        let submission: ISubmission | null;
        if (publicKey) {
            submission = await DBSubmission.findById(
                this.exchangeSubmissionKey(context, publicKey)
            );
        } else {
            submission = await DBSubmission.findOne({
                userId: context.user?.id,
                assignmentId: assignment.id,
            });
        }

        if (!submission) {
            throw new UnauthorizedError();
        }

        if (!assignment._id.equals(submission?.assignmentId)) {
            throw new UnauthorizedError();
        }

        if (submission.submittedDate) {
            throw new UnauthorizedError();
        }

        // retrieve the answers
        const answers =
            submission?.answers?.find((a) => a.blockId.equals(block._id))
                ?.data || [];

        // generate the feedback if any
        const feedback = await computeBlockFeedback({
            assignment,
            submission,
            block,
            actions,
            input: answers,
            user: context.user,
            languageData,
        });

        // update the feedback for this block in the submission
        const studentFeedback = submission.feedback?.find((f) =>
            f.blockId.equals(block._id)
        );
        if (!studentFeedback) {
            submission.feedback.push({
                blockId: block._id,
                ...feedback,
                attemptCount: 1,
            });
        } else {
            Object.assign(studentFeedback, feedback, {
                attemptCount: (studentFeedback.attemptCount || 1) + 1,
            });
        }

        // add an activity timestamp
        submission.studentActivityTimestamps = (
            submission.studentActivityTimestamps || []
        ).concat(Date.now());

        // save the changes
        await submission.save();

        log.debug(`Submission with id ${submission.id} feedback was updated.`);

        // return the block
        return block;
    }

    @Mutation((returns) => Block)
    public async completeBlock(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("publicKey", (type) => String, opt) publicKey?: string
    ): Promise<IBlock> {
        // retrieve the block
        const block = await context.loadById(DBBlock, id);

        // if the block doesn't exist, throw an error.
        if (!block) {
            throw new ApolloError(
                `Block with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        // retrieve assignment
        const assignment = await this.retrieveAssignmentFromBlock(
            context,
            block
        );

        if (!assignment) {
            throw new UnauthorizedError();
        }

        const course = await this.retrieveCourseFromAssignment(
            context,
            assignment
        );

        if (
            context.user?._id &&
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
        let submission: ISubmission | null;
        if (publicKey) {
            submission = await DBSubmission.findById(
                this.exchangeSubmissionKey(context, publicKey)
            );
        } else {
            submission = await DBSubmission.findOne({
                userId: context.user?.id,
                assignmentId: assignment.id,
            });
        }

        if (!submission) {
            throw new UnauthorizedError();
        }

        if (!assignment._id.equals(submission?.assignmentId)) {
            throw new UnauthorizedError();
        }

        // verify that the submission is not yet submitted
        if (submission.submittedDate) {
            throw new UnauthorizedError();
        }

        // if the block has feedback, check that feedback has been generated at least once
        if (!assignment?.assessmentType && block.actions?.length > 0) {
            const blockFeedback = submission.feedback?.find((f) =>
                f.blockId.equals(block._id)
            );
            if (!blockFeedback || !blockFeedback.attemptCount) {
                throw new UnauthorizedError();
            }
        }

        // mark the block as completed
        submission.completedBlocks = submission.completedBlocks || [];
        if (!submission.completedBlocks.find((b) => b.equals(block._id))) {
            submission.completedBlocks.push(block._id);
            submission.markModified("completedBlocks");
        }

        // save the changes
        await submission.save();
        // return the assignment
        return block;
    }

    //
    // Field resolvers
    //

    @FieldResolver((type) => [String], opt)
    public async answer(
        @Ctx() context: RequestContext,
        @Root() root: IBlock,
        @Arg("submissionId", (type) => ID, opt) submissionId?: string,
        @Arg("publicKey", (type) => String, opt) publicKey?: string
    ) {
        const assignment = await DBAssignment.findById(root.assignmentId);
        if (!assignment) {
            throw new UnauthorizedError();
        }

        const course = await this.retrieveCourseFromBlock(context, root);
        if (
            context.user?._id &&
            !(
                context.can(Permission.testAssignment, course) ||
                context.can(Permission.doAssignment, course) ||
                context.can(Permission.readSubmission, course)
            )
        ) {
            return null;
        }

        // retrieve the assignment submission
        let submission: ISubmission | null;
        if (submissionId) {
            if (!context.can(Permission.readSubmission, course)) {
                throw new UnauthorizedError();
            }
            submission = await DBSubmission.findById(submissionId);
        } else if (publicKey) {
            submission = await DBSubmission.findById(
                this.exchangeSubmissionKey(context, publicKey)
            );
        } else if (!publicKey && context.user?.id) {
            submission = await DBSubmission.findOne({
                assignmentId: root.assignmentId,
                userId: context.user?.id,
            });
        } else {
            return null;
        }

        if (!submission) {
            return null;
        }

        if (!assignment._id.equals(submission?.assignmentId)) {
            throw new UnauthorizedError();
        }

        if (publicKey && publicKey !== assignment.publicKey) {
            throw new UnauthorizedError();
        }
        // retrieve the answers for this block
        return submission?.answers?.find((a) => a.blockId.equals(root._id))
            ?.data;
    }

    @FieldResolver((type) => Feedback, opt)
    public async feedback(
        @Ctx() context: RequestContext,
        @Root() root: IBlock,
        @Arg("submissionId", (type) => ID, opt) submissionId?: string,
        @Arg("publicKey", (type) => String, opt) publicKey?: string
    ) {
        const assignment = await DBAssignment.findById(root.assignmentId);
        if (!assignment) {
            throw new UnauthorizedError();
        }
        const course = await this.retrieveCourseFromBlock(context, root);

        if (
            context.user?._id &&
            !(
                context.can(Permission.testAssignment, course) ||
                context.can(Permission.doAssignment, course) ||
                context.can(Permission.readSubmission, course)
            )
        ) {
            return null;
        }

        // retrieve the assignment submission
        let submission: ISubmission | null;
        if (submissionId) {
            if (!context.can(Permission.readSubmission, course)) {
                throw new UnauthorizedError();
            }
            submission = await DBSubmission.findById(submissionId);
        } else if (publicKey) {
            submission = await DBSubmission.findById(
                this.exchangeSubmissionKey(context, publicKey)
            );
        } else if (!publicKey && context.user?.id) {
            submission = await DBSubmission.findOne({
                assignmentId: root.assignmentId,
                userId: context.user?.id,
            });
        } else {
            return null;
        }

        if (!submission) {
            return null;
        }

        if (!assignment._id.equals(submission?.assignmentId)) {
            throw new UnauthorizedError();
        }

        if (publicKey && publicKey !== assignment.publicKey) {
            throw new UnauthorizedError();
        }

        // retrieve the feedback for this block
        return submission?.feedback?.find((a) => a.blockId.equals(root._id));
    }

    @FieldResolver((type) => Boolean)
    public async completed(
        @Ctx() context: RequestContext,
        @Root() root: IBlock,
        @Arg("submissionId", (type) => ID, opt) submissionId?: string,
        @Arg("publicKey", (type) => String, opt) publicKey?: string
    ) {
        const assignment = await DBAssignment.findById(root.assignmentId);
        if (!assignment) {
            throw new UnauthorizedError();
        }
        const course = await this.retrieveCourseFromBlock(context, root);

        if (
            context.user?._id &&
            !(
                context.can(Permission.testAssignment, course) ||
                context.can(Permission.doAssignment, course) ||
                context.can(Permission.readSubmission, course)
            )
        ) {
            return null;
        }

        // retrieve the assignment submission
        let submission: ISubmission | null;
        if (submissionId) {
            if (!context.can(Permission.readSubmission, course)) {
                throw new UnauthorizedError();
            }
            submission = await DBSubmission.findById(submissionId);
        } else if (publicKey) {
            submission = await DBSubmission.findById(
                this.exchangeSubmissionKey(context, publicKey)
            );
        } else if (!publicKey && context.user?.id) {
            submission = await DBSubmission.findOne({
                assignmentId: root.assignmentId,
                userId: context.user?.id,
            });
        } else {
            return false;
        }

        if (!submission) {
            return false;
        }

        if (!assignment._id.equals(submission?.assignmentId)) {
            throw new UnauthorizedError();
        }

        if (publicKey && publicKey !== assignment.publicKey) {
            throw new UnauthorizedError();
        }

        return Boolean(
            submission?.submittedDate ||
                submission?.completedBlocks?.find((b) => b.equals(root._id))
        );
    }

    @FieldResolver((type) => String)
    public async solution(
        @Ctx() context: RequestContext,
        @Root() root: IBlock
    ) {
        // if the user is making this assignment, only show the solution if the block is completed
        const course = await this.retrieveCourseFromBlock(context, root);
        if (
            context.getRole(course) === RoleType.courseStudent &&
            !(await this.completed(context, root)) &&
            !(await this.blockIsClosed(context, root))
        ) {
            return null;
        }

        return root.solution;
    }

    @FieldResolver((type) => Boolean)
    public async hasSolution(@Root() root: IBlock) {
        return Boolean(
            root.solution || root.type === BlockType.MultipleChoiceQuestion
        );
    }

    @FieldResolver((type) => [Action])
    public async actions(@Root() root: IBlock) {
        const actions = await DBAction.find({ blockId: root?._id });
        const ids = root.actions;

        return (actions || []).sort(
            (a, b) => ids.indexOf(a._id) - ids.indexOf(b._id)
        );
    }

    @FieldResolver((type) => Boolean)
    public async isAssessed(
        @Ctx() context: RequestContext,
        @Root() root: IBlock,
        @Arg("submissionId", (type) => ID) submissionId: string
    ) {
        if (root.type === BlockType.Text) {
            return true;
        }
        const submission = await DBSubmission.findById(submissionId);
        const assignment = await DBAssignment.findById(
            submission?.assignmentId
        );
        if (!assignment) {
            throw new UnauthorizedError();
        }
        const course = await this.retrieveCourseFromAssignment(
            context,
            assignment
        );
        if (!context.can(Permission.readSubmission, course)) {
            throw new UnauthorizedError();
        }
        const score = (await this.feedback(context, root, submissionId))?.score;
        return Boolean(score !== undefined && score !== null);
    }
    @FieldResolver((type) => [File], opt)
    public async files(
        @Ctx() context: RequestContext,
        @Root() root: IBlock,
        @Arg("submissionId", (type) => ID, opt) submissionId?: string,
        @Arg("userId", (type) => ID, opt) userId?: string
    ) {
        const assignment = await DBAssignment.findById(root.assignmentId);
        if (!assignment) {
            throw new UnauthorizedError();
        }
        // check that the user has permission to view this field
        if (userId || submissionId) {
            // check that the user is allowed to view submission data
            const course = await this.retrieveCourseFromBlock(context, root);
            if (!context.can(Permission.readSubmission, course)) {
                throw new UnauthorizedError();
            }
        }

        userId = userId || context.user?.id;

        // retrieve the assignment submission
        let submission: ISubmission | null;
        if (submissionId) {
            submission = await DBSubmission.findById(submissionId);
        } else if (userId) {
            submission = await DBSubmission.findOne({
                assignmentId: root.assignmentId,
                userId,
            });
        } else {
            return null;
        }

        // retrieve the answers for this block
        return submission?.answers?.find((a) => a.blockId.equals(root._id))
            ?.files;
    }

    //
    // Helpers
    //

    private exchangeSubmissionKey(context: RequestContext, publicKey?: string) {
        if (!publicKey) {
            return null;
        }
        const token = context.req.cookies[`${submissionKeyString}${publicKey}`];
        if (!token) {
            return null;
        }
        return exchangeCode<{ submissionId: string }>(
            config.auth.anonymousSecret,
            token
        ).submissionId;
    }

    private async retrieveAssignmentFromBlock(
        context: RequestContext,
        block?: IBlock | null
    ): Promise<IAssignment | null> {
        if (!block) {
            return null;
        }

        const assignment = await context.loadById(
            DBAssignment,
            block.assignmentId
        );
        return assignment;
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

    private async blockIsClosed(
        context: RequestContext,
        block?: IBlock | null
    ): Promise<boolean> {
        if (!block) {
            return true;
        }

        const assignment = await context.loadById(
            DBAssignment,
            block.assignmentId
        );
        const module = await context.loadById(DBModule, assignment?.moduleId);
        const course = await context.loadById(DBCourse, module?.courseId);

        const endDates: Date[] = [];
        if (course?.endDate) {
            endDates.push(new Date(course.endDate));
        }
        if (module?.endDate) {
            endDates.push(new Date(module.endDate));
        }
        const endDate = endDates.length > 0 ? min(endDates) : null;

        return Boolean(endDate && isAfter(new Date(), endDate));
    }
}
