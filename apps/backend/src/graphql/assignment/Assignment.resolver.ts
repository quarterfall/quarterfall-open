import { ApolloError } from "apollo-server-express";
import { config, submissionKeyString } from "config";
import {
    ActionType,
    arrayMove,
    AssessmentMethod,
    AssignmentEventType,
    BlockType,
    generateId,
    gradingSchemeDefaults,
    Permission,
    PublicLicenseType,
    RoleType,
    ServerError,
    SubmissionEventType,
} from "core";
import { DBAction } from "db/Action";
import { DBAssignment, IAssignment } from "db/Assignment";
import { DBBlock } from "db/Block";
import { DBCourse, ICourse } from "db/Course";
import { DBGradingScheme } from "db/GradingScheme";
import { DBModule } from "db/Module";
import { DBOrganization } from "db/Organization";
import { DBRole } from "db/Role";
import { DBSubmission, ISubmission } from "db/Submission";
import { DBUser } from "db/User";
import { postEvent } from "event/Event";
import { Block } from "graphql/block/Block";
import { Course } from "graphql/course/Course";
import { GradingScheme } from "graphql/gradingScheme/GradingScheme";
import { Module } from "graphql/module/Module";
import humanInterval from "human-interval";
import { log } from "Logger";
import { deleteAction } from "operations/Action.operation";
import {
    assignmentIsCompleted,
    assignmentIsStudyMaterial,
    copyAssignment,
    copyAssignmentFiles,
    deleteAssignment,
} from "operations/Assignment.operation";
import { computeBlockFeedback } from "operations/Feedback.operation";
import {
    computeAssignmentGrade,
    computeAssignmentScore,
} from "operations/Grading.operation";
import { RequestContext } from "RequestContext";
import { createAssignmentSearchString } from "search/AssignmentSearchString";
import { createCode, exchangeCode } from "Security";
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
import { Submission } from "../submission/Submission";
import { Assignment } from "./Assignment";
import { AssignmentCreateInput } from "./AssignmentCreate.input";
import { AssignmentUpdateInput } from "./AssignmentUpdate.input";
import { AssignmentUpdateReviewInput } from "./AssignmentUpdateReview.input";

const opt = { nullable: true };

@Resolver(Assignment)
export class AssignmentResolver {
    @Authorized()
    @Query((returns) => Assignment, opt)
    public async assignment(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ) {
        const assignment = await context.loadById(DBAssignment, id);

        const course = await this.retrieveCourseFromAssignment(
            context,
            assignment
        );

        if (!course || !context.can(Permission.readCourse, course)) {
            throw new UnauthorizedError();
        }

        return assignment;
    }

    @Query((returns) => Assignment, opt)
    public async assignmentByKey(
        @Ctx() context: RequestContext,
        @Arg("publicKey", (type) => String) publicKey: string
    ) {
        const assignment = await DBAssignment.findOne({ publicKey });
        if (!assignment) {
            throw new UnauthorizedError();
        }

        const course = await this.retrieveCourseFromAssignment(
            context,
            assignment
        );

        const organization = await DBOrganization.findById(
            course?.organizationId
        );

        if (!organization?.allowAnonymousSubmissions) {
            throw new UnauthorizedError();
        }

        return assignment;
    }

    @Authorized()
    @Mutation((returns) => Module)
    public async mergeAssignment(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("targetIndex", (type) => Int, opt) targetIndex?: number
    ) {
        // retrieve the assignment
        const assignment = await context.loader(DBAssignment).load(id);
        if (!assignment) {
            throw new ApolloError(
                `Assignment with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        // retrieve the module
        const module = await context.loadById(DBModule, assignment.moduleId);
        if (!module) {
            throw new ApolloError(
                `Module with id ${assignment.moduleId} not found.`,
                ServerError.NotFound
            );
        }

        // retrieve the course
        const course = await context.loadById(DBCourse, module.courseId);

        // check that the logged in user is allowed to change this module
        if (!context.can(Permission.updateCourse, course) || course?.archived) {
            throw new UnauthorizedError();
        }

        // index is previous assignment by default
        if (targetIndex === undefined) {
            targetIndex = assignment.index - 1;
        }

        // find the target assignment
        const targetAssignment = await DBAssignment.findOne({
            index: targetIndex,
            moduleId: assignment.moduleId,
        });

        if (!targetAssignment) {
            throw new ApolloError(
                `Target assignment for merge with assignment with id ${id} not found.`
            );
        }

        if (targetAssignment._id.equals(assignment._id)) {
            throw new ApolloError(
                `Cannot merge assignment with itself (${assignment.id} == ${targetAssignment.id}).`
            );
        }

        // move the blocks from the original assignment to the target assignment
        const targetBlockCount = await DBBlock.countDocuments({
            assignmentId: targetAssignment._id,
        });
        const blocks = await DBBlock.find({
            assignmentId: assignment._id,
        });
        await Promise.all(
            blocks.map(async (block) => {
                block.index += targetBlockCount;
                block.assignmentId = targetAssignment._id;
                return block.save();
            })
        );

        // copy the assignment's files to the target assignment
        const newFiles = await copyAssignmentFiles(
            assignment,
            targetAssignment._id
        );
        targetAssignment.files = (targetAssignment.files || []).concat(
            newFiles
        );

        await targetAssignment.save();

        log.notice(
            `Merged assignment ${assignment.id} with target assignment ${targetAssignment.id}.`
        );

        // finally, delete this assignment
        await deleteAssignment(assignment);

        return module;
    }

    @Authorized()
    @Mutation((returns) => Module)
    public async createAssignment(
        @Ctx() context: RequestContext,
        @Arg("input") input: AssignmentCreateInput,
        @Arg("moduleId", (type) => ID) moduleId: string,
        @Arg("beforeIndex", (type) => Int, opt) beforeIndex?: number
    ) {
        const module = await context.loader(DBModule).load(moduleId);
        if (!module) {
            throw new ApolloError(
                `Module with id ${moduleId} not found.`,
                ServerError.NotFound
            );
        }

        // retrieve the course
        const course = await context.loadById(DBCourse, module.courseId);

        // check that the logged in user is allowed to change this module
        if (!context.can(Permission.updateCourse, course) || course?.archived) {
            throw new UnauthorizedError();
        }

        // determine the index to store with the assignment
        const index =
            beforeIndex !== undefined
                ? beforeIndex - 0.5
                : Number.MAX_SAFE_INTEGER;

        const titleSearchString = this.createTitleStringForSearch(input.title);

        const orgGradingSchemes = await DBGradingScheme.find({
            organizationId: context?.organization?.id,
        });

        const defaultGradingScheme = !orgGradingSchemes.length
            ? gradingSchemeDefaults?.find((s) => s.isDefault)
            : orgGradingSchemes?.find((s) => s.isDefault);

        const extraInput: any = {
            searchString: createAssignmentSearchString(titleSearchString, []),
            moduleId,
            forceBlockOrder: true,
            index,
            gradingSchemeName: defaultGradingScheme?.name,
            gradingSchemeDescription: defaultGradingScheme?.description,
            gradingSchemeCode: defaultGradingScheme?.code,
            publicKey: generateId({
                allowed: ["numbers", "lowercaseLetters"],
                length: 8,
            }),
        };

        // create the assignment
        const assignment = await DBAssignment.create(
            Object.assign(extraInput, input)
        );

        // regenerate the indices for all the assignments in the module
        const assignments = await DBAssignment.find({
            moduleId,
        }).sort("index");
        await Promise.all(
            assignments.map(async (a, i) => {
                a.index = i;
                await a.save();
            })
        );

        postEvent({
            type: AssignmentEventType.AssignmentCreated,
            organizationId: context?.organization?.id,
            subjects: [course?.id],
            data: {
                assignment: {
                    id: assignment?.id,
                    title: assignment?.title,
                },
                module: {
                    id: module?.id,
                    title: module?.title,
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
                link: `/assignment/${assignment.id}`,
            },
        });

        log.notice(
            `Created new assignment "${assignment.title}" (${assignment.id}, in module ${module.id}).`
        );

        // return the assignment
        return module;
    }

    @Authorized()
    @Mutation((returns) => Assignment)
    public async updateAssignment(
        @Arg("id", (type) => ID) id: string,
        @Arg("input") input: AssignmentUpdateInput,
        @Ctx() context: RequestContext
    ) {
        let assignment: IAssignment | null = await context.loadById(
            DBAssignment,
            id
        );

        if (!assignment) {
            throw new ApolloError(
                `Assignment with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        const module = await context.loadById(DBModule, assignment.moduleId);
        if (!module) {
            throw new ApolloError(
                `Module with id ${assignment?.moduleId} not found.`,
                ServerError.NotFound
            );
        }

        // retrieve the course
        const course = await context.loadById(DBCourse, module.courseId);

        // check that the logged in user is allowed to change this assignment
        if (!context.can(Permission.updateCourse, course) || course?.archived) {
            throw new UnauthorizedError();
        }

        if (input.assessmentType === null) {
            const blocks = await DBBlock.find({
                assignmentId: assignment?._id,
            });
            for (const block of blocks) {
                const actions = await DBAction.find({
                    blockId: block?.id,
                    type: ActionType.Scoring,
                });

                for (const action of actions) {
                    await deleteAction(action);
                    log.debug(
                        `Scoring actions are deleted from block ${block.id}.`
                    );
                }

                // save the updated block and return it
                await block.save();
            }
        }

        assignment = await DBAssignment.findByIdAndUpdate(
            id,
            Object.assign(input),
            {
                new: true,
            }
        );

        if (!assignment) {
            throw new ApolloError(
                `Assignment with id ${id} not found`,
                ServerError.NotFound
            );
        }

        // regenerate the search string if needed
        if (input.title || input.keywords) {
            const titleSearchString = this.createTitleStringForSearch(
                assignment.title
            );
            assignment.searchString = createAssignmentSearchString(
                titleSearchString,
                assignment.keywords || []
            );
            log.debug(
                `Assignment "${assignment.title}" (${assignment.id}) new search string: [${assignment.searchString}].`
            );
        }

        // if input has assessment type, add assessment settings to all blocks inside the assignment
        if (input.assessmentType) {
            if (
                !assignment?.gradingSchemeName ||
                !assignment?.gradingSchemeCode
            ) {
                const orgGradingSchemes = await DBGradingScheme.find({
                    organizationId: context?.organization?.id,
                });

                const defaultGradingScheme = !orgGradingSchemes.length
                    ? gradingSchemeDefaults?.find((s) => s.isDefault)
                    : orgGradingSchemes?.find((s) => s.isDefault);

                assignment.gradingSchemeName = defaultGradingScheme?.name;
                assignment.gradingSchemeCode = defaultGradingScheme?.code;
                assignment.gradingSchemeDescription =
                    defaultGradingScheme?.description;
            }

            const blocks = await DBBlock.find({ assignmentId: assignment?.id });
            if (blocks) {
                await Promise.all(
                    blocks.map(async (b) => {
                        const input = {
                            assessmentMethod:
                                b.type === BlockType.MultipleChoiceQuestion
                                    ? AssessmentMethod["correctAnswer"]
                                    : undefined,
                            weight: 1,
                            granularity: 1,
                            hasRangeLimit: true,
                            criteriaText: "",
                        };
                        await b.set(input).save();
                    })
                );
            }
        }

        postEvent({
            type: AssignmentEventType.AssignmentUpdated,
            organizationId: context?.organization?.id,
            subjects: [course?.id],
            data: {
                assignment: {
                    id: assignment?.id,
                    title: assignment?.title,
                },
                module: {
                    id: module?.id,
                    title: module?.title,
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
                link: `/assignment/${assignment.id}`,
            },
        });

        log.notice(
            `Assignment "${assignment.title}" (${assignment.id}) updated.`,
            input
        );

        // return the assignment
        return assignment.save();
    }

    @Authorized()
    @Mutation((returns) => Course)
    public async copyAssignment(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("moduleId", (type) => ID, opt) moduleId?: string
    ) {
        const assignment = await context.loader(DBAssignment).load(id);

        // if the assignment doesn't exist, throw an error.
        if (!assignment) {
            throw new ApolloError(`Assignment with id ${id} not found.`);
        }
        const assignmentOldModuleId = assignment.moduleId;

        // retrieve the associated module and course
        const module = await context.loadById(
            DBModule,
            moduleId || assignment.moduleId
        );
        if (!module) {
            throw new ApolloError(
                `Module with id ${moduleId || assignment.moduleId} not found.`
            );
        }

        const course = await context.loadById(DBCourse, module.courseId);
        if (!course) {
            throw new ApolloError(
                `Course with id ${module.courseId} not found.`
            );
        }

        // check that the user has permission to update the course and that the course is not archived
        if (!context.can(Permission.updateCourse, course) || course.archived) {
            throw new UnauthorizedError();
        }

        // make a copy of the assignment
        await copyAssignment(assignment, moduleId ? module.id : undefined);

        log.notice(
            `Assignment "${assignment.title}" (${assignment.id}) copied from module ${assignmentOldModuleId} to module ${module.id}.`
        );

        // return the course
        return course;
    }

    @Authorized()
    @Mutation((returns) => Module)
    public async deleteAssignment(
        @Arg("id", (type) => ID) id: string,
        @Ctx() context: RequestContext
    ) {
        // retrieve the assignment
        const assignment = await context.loadById(DBAssignment, id);

        // if the assignment doesn't exist, throw an error.
        if (!assignment) {
            throw new ApolloError(`Assignment with id ${id} not found.`);
        }

        const module = await context.loadById(DBModule, assignment.moduleId);
        const course = await context.loadById(DBCourse, module?.courseId);
        // check that the logged in user is allowed to delete this assignment
        if (!context.can(Permission.updateCourse, course) || course?.archived) {
            throw new UnauthorizedError();
        }

        log.notice(
            `Assignment "${assignment.title}" (${assignment.id}) deleted.`
        );

        // delete the assignment
        await deleteAssignment(assignment);

        postEvent({
            type: AssignmentEventType.AssignmentDeleted,
            organizationId: context?.organization?.id,
            subjects: [course?.id],
            data: {
                assignment: {
                    id: assignment?.id,
                    title: assignment?.title,
                },
                module: {
                    id: module?.id,
                    title: module?.title,
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
                link: `/course/${course?.id}`,
            },
        });

        // return the module
        return module;
    }

    @Authorized()
    @Mutation((returns) => Assignment)
    public async shareAssignment(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ) {
        const assignment = await context.loadById(DBAssignment, id);
        if (!assignment) {
            throw new ApolloError(
                `Assignment with id ${id} not found.`,
                ServerError.NotFound
            );
        }
        const course = await this.retrieveCourseFromAssignment(
            context,
            assignment
        );

        // check that the logged in user is allowed to delete this assignment
        if (!context.can(Permission.updateCourse, course) || course?.archived) {
            throw new UnauthorizedError();
        }

        // generate a new code
        assignment.shareCode = generateId({
            length: 6,
            allowed: ["numbers", "uppercaseLetters"],
        });
        await assignment.save();

        log.notice(
            `Assignment with id ${assignment.id} can now be shared with code ${assignment.shareCode}.`
        );

        return assignment;
    }

    @Authorized()
    @Mutation((returns) => Assignment)
    public async stopSharingAssignment(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ) {
        const assignment = await context.loadById(DBAssignment, id);
        if (!assignment) {
            throw new ApolloError(
                `Assignment with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        const course = await this.retrieveCourseFromAssignment(
            context,
            assignment
        );

        // check that the logged in user is allowed to delete this assignment
        if (!context.can(Permission.updateCourse, course) || course?.archived) {
            throw new UnauthorizedError();
        }

        assignment.shareCode = undefined;
        await assignment.save();

        log.notice(
            `Assignment with id ${assignment.id} can not be shared anymore.`
        );

        return assignment;
    }

    @Authorized()
    @Mutation((returns) => Course)
    public async importAssignment(
        @Ctx() context: RequestContext,
        @Arg("code") code: string,
        @Arg("moduleId", (type) => ID) moduleId: string
    ): Promise<ICourse | null> {
        // find the course by code
        const assignment = await DBAssignment.findOne({
            shareCode: code.toUpperCase(),
        });

        if (!assignment) {
            throw new ApolloError(
                `Assignment with code ${code} not found.`,
                ServerError.NotFound
            );
        }

        const module = await context.loadById(DBModule, moduleId);

        const course = await this.copyAssignment(
            context,
            assignment.id,
            module?.id
        );

        log.notice(`Assignment with id ${assignment.id} is imported.`);

        return course;
    }

    @Authorized()
    @Mutation((returns) => Course)
    public async moveAssignmentToIndex(
        @Ctx() context: RequestContext,
        @Arg("index", (type) => Int) index: number,
        @Arg("moduleId", (type) => ID) moduleId: string,
        @Arg("assignmentId", (type) => ID) assignmentId: string
    ): Promise<ICourse | null> {
        // retrieve the destination module
        const destinationModule = await context.loader(DBModule).load(moduleId);

        // if the module doesn't exist, throw an error
        if (!destinationModule) {
            throw new ApolloError(
                `Module with id ${moduleId} not found.`,
                ServerError.NotFound
            );
        }

        // retrieve the course associated with the module
        const course = await context.loadById(
            DBCourse,
            destinationModule.courseId
        );

        // check that the logged in user is allowed to change the destination module
        if (!context.can(Permission.updateCourse, course) || course?.archived) {
            throw new UnauthorizedError();
        }

        // retrieve the assignment
        const assignment = await context.loadById(DBAssignment, assignmentId);
        if (!assignment) {
            throw new ApolloError(
                `Assignment with id ${assignmentId} not found.`,
                ServerError.NotFound
            );
        }

        // retrieve all the source assignments and sort them by index
        const sourceAssignments = await DBAssignment.find({
            moduleId: assignment.moduleId,
        }).sort("index");

        const oldIndex = sourceAssignments.findIndex((value) =>
            value._id.equals(assignment._id)
        );
        // check that the old index is valid
        if (oldIndex < 0 || oldIndex >= sourceAssignments.length) {
            throw new ApolloError(`Invalid existing index ${oldIndex}.`);
        }

        let destinationAssignments = sourceAssignments;
        // if we're moving between modules, retrieve all assignments of the destination module and sort them by index
        if (!assignment.moduleId.equals(moduleId)) {
            destinationAssignments = await DBAssignment.find({
                moduleId,
            }).sort("index");
        }

        // check that the index is valid
        if (index < 0 || index > destinationAssignments.length) {
            throw new ApolloError(`Invalid index ${index}.`);
        }

        // move the assignment
        arrayMove({
            array: sourceAssignments,
            oldIndex,
            newIndex: index,
            newArray: destinationAssignments,
        });

        // update the assignment indices
        await Promise.all(
            sourceAssignments.map(async (a, i) => {
                a.index = i;
                await a.save();
            })
        );

        await Promise.all(
            destinationAssignments.map(async (a, i) => {
                a.moduleId = destinationModule._id;
                a.index = i;
                await a.save();
            })
        );

        log.debug(
            `Assignment "${assignment.title}" (${assignment.id}) moved to index ${index} in module ${moduleId}.`
        );

        return course;
    }

    @Mutation((returns) => Submission)
    public async startSubmission(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("publicKey", (type) => String, opt) publicKey?: string
    ): Promise<ISubmission> {
        // retrieve the assignment and the associated course
        const assignment = await context.loader(DBAssignment).load(id);

        if (!assignment) {
            throw new ApolloError(
                `Assignment with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        //use public key as security check
        const course = await this.retrieveCourseFromAssignment(
            context,
            assignment
        );

        // check that the logged in user is allowed to create a submission for this assignment

        if (
            context.user?._id &&
            !(
                context.can(Permission.doAssignment, course) ||
                context.can(Permission.testAssignment, course)
            )
        ) {
            throw new UnauthorizedError();
        }

        if (publicKey && publicKey !== assignment.publicKey) {
            throw new UnauthorizedError();
        }

        if (course?.archived) {
            throw new UnauthorizedError();
        }

        const submission = await DBSubmission.create({
            assignmentId: assignment.id,
            userId: publicKey ? undefined : context.user?.id,
            organizationId: context.organization?._id,
            studentActivityTimestamps: [Date.now()],
        });

        if (publicKey) {
            const token = createCode<{ submissionId: string }>(
                { submissionId: submission.id },
                config.auth.anonymousLinkLifeTime,
                config.auth.anonymousSecret
            );

            context.res.cookie(`${submissionKeyString}${publicKey}`, token, {
                domain: config.domain,
                maxAge: humanInterval(config.auth.anonymousLinkLifeTime),
                httpOnly: true,
            });
        } else {
            postEvent({
                type: SubmissionEventType.SubmissionCreated,
                organizationId: context?.organization?.id,
                subjects: [course?.id],
                data: {
                    assignment: {
                        id: assignment?.id,
                        title: assignment?.title,
                    },
                    course: {
                        id: course?.id,
                        title: course?.title,
                        description: course?.description,
                    },
                    submission: {
                        student: {
                            id: context?.user?.id,
                            firstName: context?.user?.firstName,
                            lastName: context?.user?.lastName,
                            emailAddress: context?.user?.emailAddress,
                        },
                    },
                },
                metadata: {
                    link: `/assignment/${assignment.id}`,
                },
            });
        }

        // retrieve the submission or create if needed
        return submission;
    }

    @Authorized()
    @Mutation((returns) => Assignment)
    public async recalculateGrades(
        @Arg("id", (type) => ID) id: string,
        @Ctx() context: RequestContext
    ): Promise<IAssignment | null> {
        const assignment = await context.loader(DBAssignment).load(id);

        if (!assignment) {
            throw new ApolloError(
                `Assignment with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        const course = await this.retrieveCourseFromAssignment(
            context,
            assignment
        );

        if (!context.can(Permission.updateCourse, course) || course?.archived) {
            throw new UnauthorizedError();
        }

        const submissions = await DBSubmission.find({
            assignmentId: assignment.id,
        });

        for (let submission of submissions) {
            submission.grade = await computeAssignmentGrade(
                submission,
                assignment
            );
            submission.isApproved = false;
            log.notice(
                `Submission with id ${submission.id} has been recalculated with grading scheme ${assignment?.gradingSchemeName}.`
            );
            await submission.save();
        }

        return assignment;
    }

    @Authorized()
    @Mutation((returns) => Assignment)
    public async recordAssignmentActivity(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ): Promise<IAssignment> {
        const submission = await context.loadById(DBSubmission, id);

        if (!submission) {
            throw new ApolloError(
                `Submission with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        // retrieve the assignment and the associated course
        const assignment = await DBAssignment.findById(submission.assignmentId);

        if (!assignment) {
            throw new ApolloError(
                `Assignment with id ${submission?.assignmentId} not found.`,
                ServerError.NotFound
            );
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

        // Verify that the submission belongs to the user
        if (context.user && !context.user._id.equals(submission.userId)) {
            throw new UnauthorizedError();
        }

        if (course?.archived) {
            throw new UnauthorizedError();
        }

        // if the submission is already submitted, do nothing
        if (submission.submittedDate) {
            return assignment;
        }

        // update the timestamp
        submission.studentActivityTimestamps =
            submission.studentActivityTimestamps || [];
        submission.studentActivityTimestamps.push(Date.now());
        await submission.save();

        return assignment;
    }

    @Authorized()
    @Mutation((returns) => Assignment)
    public async updateAssignmentReview(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("input") input: AssignmentUpdateReviewInput
    ): Promise<IAssignment> {
        const submission = await DBSubmission.findById(id);

        // verify that the submission was not yet submitted
        if (!submission || submission.submittedDate) {
            throw new ApolloError(
                `Submission with id ${id} not found or assignment was already submitted.`,
                ServerError.NotFound
            );
        }

        // retrieve the assignment and the associated course
        const assignment = await DBAssignment.findById(submission.assignmentId);

        if (!assignment) {
            throw new ApolloError(
                `Assignment with id ${submission.assignmentId} not found.`,
                ServerError.NotFound
            );
        }

        const course = await this.retrieveCourseFromAssignment(
            context,
            assignment
        );

        // check that the logged in user is allowed to create a submission for this assignment

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

        // Verify that the submission belongs to the user
        if (context.user && !context.user._id.equals(submission.userId)) {
            throw new UnauthorizedError();
        }

        // update the submission with the review data and add a activity timestamp
        await submission.updateOne({
            ...input,
            studentActivityTimestamps: (
                submission.studentActivityTimestamps || []
            ).concat(Date.now()),
        });

        log.notice(
            `Assignment "${assignment.title}" (${assignment.id}) review updated by ${context.user?.firstName} ${context.user?.lastName} (${context.user?.id}) with submission id ${submission.id}.`
        );

        return assignment;
    }

    @Authorized()
    @Mutation((returns) => Assignment)
    public async submitAssignment(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("input", opt) input?: AssignmentUpdateReviewInput
    ): Promise<IAssignment> {
        // update the assignment review if an input is supplied
        if (input) {
            await this.updateAssignmentReview(context, id, input);
        }
        const submission = await DBSubmission.findById(id);

        // verify that the submission belongs to the user
        if (context.user && !context.user?._id.equals(submission?.userId)) {
            throw new UnauthorizedError();
        }

        // verify that the submission was not yet submitted
        if (!submission || submission.submittedDate) {
            throw new ApolloError(
                `Submission with id ${id} not found or assignment was already submitted.`,
                ServerError.NotFound
            );
        }

        // retrieve the assignment and the associated course
        const assignment = await DBAssignment.findById(submission.assignmentId);

        if (!assignment) {
            throw new ApolloError(
                `Assignment with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        const course = await this.retrieveCourseFromAssignment(
            context,
            assignment
        );

        if (
            !course ||
            (context.user?._id &&
                !(
                    context.can(Permission.doAssignment, course) ||
                    context.can(Permission.testAssignment, course)
                ))
        ) {
            throw new UnauthorizedError();
        }

        if (course?.archived) {
            throw new UnauthorizedError();
        }

        const blocks = await DBBlock.find({
            assignmentId: assignment?.id,
        });

        if ((submission.completedBlocks || []).length !== blocks.length) {
            throw new ApolloError(
                `The length of completed blocks is not equal to the length of the blocks`,
                ServerError.NotFound
            );
        }

        // update the submission with the feedback setting, submission date and add an activity timestamp
        submission.submittedDate = new Date();
        submission.studentActivityTimestamps = (
            submission.studentActivityTimestamps || []
        ).concat(Date.now());

        // compute the time spent on the assignment
        submission.time = this._computeTimeSpent(submission);

        if (assignment?.assessmentType) {
            //Compute scoring actions
            await this._computeScoringActions(submission, assignment, context);

            //Compute initial assignment score and grades
            submission.score = await computeAssignmentScore(
                submission,
                assignment
            );
            submission.grade = await computeAssignmentGrade(
                submission,
                assignment
            );
        }

        // save the submission
        await submission.save();

        const student = await DBUser.findById(submission?.userId);

        course.analyticsNeedRecompute = true;
        await course.save();

        postEvent({
            type: SubmissionEventType.SubmissionSubmitted,
            organizationId: context?.organization?.id,
            subjects: [course?.id, assignment?.id, submission?.id],
            data: {
                assignment: {
                    id: assignment?.id,
                    title: assignment?.title,
                },
                submission: {
                    id: submission?.id,
                    student: {
                        firstName: student?.firstName,
                        lastName: student?.lastName,
                    },
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
                link: `/submission/${submission?.id}`,
            },
        });

        log.notice(
            `Assignment "${assignment.title}" (${assignment.id}) submitted by ${context.user?.firstName} ${context.user?.lastName} (${context.user?.id}) with submission id ${submission.id}.`
        );

        return assignment;
    }

    //
    // Field resolvers
    //

    @FieldResolver((type) => [Block])
    public async blocks(@Root() root: IAssignment) {
        return DBBlock.find({ assignmentId: root._id }).sort("index");
    }

    @FieldResolver((type) => Module, opt)
    public async module(
        @Ctx() context: RequestContext,
        @Root() root: IAssignment
    ) {
        if (!root.moduleId) {
            return null;
        }

        return context.loadById(DBModule, root.moduleId);
    }

    @FieldResolver((type) => Course, opt)
    public async course(
        @Ctx() context: RequestContext,
        @Root() root: IAssignment
    ) {
        const m = await context.loadById(DBModule, root.moduleId);
        if (!m) {
            throw new ApolloError(
                `Module with id not found.`,
                ServerError.NotFound
            );
        }
        const c = await context.loadById(DBCourse, m.courseId);
        if (!context.can(Permission.readCourse, c)) {
            throw new UnauthorizedError();
        }
        return c;
    }

    @FieldResolver((type) => PublicLicenseType)
    public license(@Root() root: IAssignment): PublicLicenseType {
        return root.license || PublicLicenseType.none;
    }

    @FieldResolver((type) => Boolean)
    public async isStudyMaterial(@Root() root: IAssignment): Promise<boolean> {
        return assignmentIsStudyMaterial(root);
    }

    @FieldResolver((type) => Number, opt)
    public async avgUsefulness(
        @Ctx() context: RequestContext,
        @Root() root: IAssignment
    ): Promise<number | null> {
        const course = await this.retrieveCourseFromAssignment(context, root);

        if (!context.can(Permission.readSubmission, course)) {
            return null;
        }
        // retrieve the submissions
        const submissions = await DBSubmission.find({
            assignmentId: root._id,
            submittedDate: { $exists: true },
            studentRatingUsefulness: { $exists: true },
        });
        if (submissions.length === 0) {
            return null;
        }
        const total = submissions.reduce(
            (t, c) => t + (c.studentRatingUsefulness || 0),
            0
        );

        return total / submissions.length;
    }

    @FieldResolver((type) => Number, opt)
    public async avgDifficulty(
        @Ctx() context: RequestContext,
        @Root() root: IAssignment
    ): Promise<number | null> {
        const course = await this.retrieveCourseFromAssignment(context, root);

        if (!context.can(Permission.readSubmission, course)) {
            return null;
        }
        // retrieve the submissions
        const submissions = await DBSubmission.find({
            assignmentId: root._id,
            submittedDate: { $exists: true },
            studentRatingDifficulty: { $exists: true },
        });
        if (submissions.length === 0) {
            return null;
        }
        const total = submissions.reduce(
            (t, c) => t + (c.studentRatingDifficulty || 0),
            0
        );
        return total / submissions.length;
    }

    @FieldResolver((type) => Boolean)
    public async completed(
        @Ctx() context: RequestContext,
        @Arg("userId", (type) => ID, opt) userId: string,
        @Arg("submissionId", (type) => ID, opt) submissionId: string,
        @Root() root: IAssignment
    ): Promise<boolean> {
        if (userId || submissionId) {
            // check that the user is allowed to view submission data
            const course = await this.retrieveCourseFromAssignment(
                context,
                root
            );

            if (!context.can(Permission.readSubmission, course)) {
                throw new UnauthorizedError();
            }
        }
        if (submissionId) {
            // check that the submission exists and is submitted
            const submission = await DBSubmission.findOne({
                _id: submissionId,
                submittedDate: { $exists: true, $lte: new Date() },
            });
            return Boolean(submission);
        }
        if (!userId && context.user) {
            userId = context.user.id;
        }
        return Boolean(userId) && assignmentIsCompleted(root._id, userId);
    }

    @FieldResolver((type) => Submission, opt)
    public async submission(
        @Ctx() context: RequestContext,
        @Root() root: IAssignment,
        @Arg("publicKey", (type) => String, opt) publicKey?: string
    ) {
        const anonymousKey =
            context.req.cookies[`${submissionKeyString}${publicKey}`];

        if (!anonymousKey && publicKey) {
            return this.startSubmission(context, root.id, publicKey);
        }

        const course = await this.retrieveCourseFromAssignment(context, root);

        if (
            context.user?._id &&
            !(
                context.can(Permission.readSubmission, course) ||
                context.can(Permission.doAssignment, course) ||
                context.can(Permission.testAssignment, course)
            )
        ) {
            return null;
        }

        if (publicKey) {
            return DBSubmission.findById(
                this.exchangeSubmissionKey(context, publicKey)
            );
        } else {
            return DBSubmission.findOne({
                assignmentId: root.id,
                userId: context.user!._id,
            });
        }
    }

    @FieldResolver((type) => [Submission], opt)
    public async submissions(
        @Root() root: IAssignment,
        @Ctx() context: RequestContext
    ) {
        const course = await this.retrieveCourseFromAssignment(context, root);

        if (!context.can(Permission.readSubmission, course)) {
            return null;
        }

        const roles = await DBRole.find({
            subjectId: course?.id,
            role: RoleType.courseStudent,
            active: true,
        });

        const users = await DBUser.find({
            _id: { $in: roles.map((r) => r.userId) },
        })
            .sort("lastName")
            .collation({ locale: "en", alternate: "shifted" });

        const userIds = users.map((u) => u._id);

        return DBSubmission.aggregate([
            {
                $match: {
                    // Filtering
                    $and: [
                        { assignmentId: root._id },
                        { userId: { $in: userIds } },
                        { submittedDate: { $exists: true } },
                    ],
                },
            },
            {
                $addFields: {
                    __order: { $indexOfArray: [userIds, "$userId"] }, // this is required for sorting by the userId array
                    id: { $toString: "$_id" }, // aggregate removes the id field from the document, so we add it back
                },
            },
            { $sort: { isApproved: 1, __order: 1 } },
            { $unset: ["__order"] }, // this is removed as we don't require the field after sorting
        ]);
    }

    @FieldResolver((type) => Boolean)
    public async hasSubmissions(
        @Root() root: IAssignment,
        @Ctx() context: RequestContext
    ) {
        const course = await this.retrieveCourseFromAssignment(context, root);

        if (!context.can(Permission.readSubmission, course)) {
            return false;
        }
        return (
            (await DBSubmission.countDocuments({
                submittedDate: { $exists: true },
                assignmentId: root.id,
            })) > 0
        );
    }

    @FieldResolver((type) => Number, opt)
    public async submissionCount(
        @Root() root: IAssignment,
        @Ctx() context: RequestContext
    ) {
        const course = await this.retrieveCourseFromAssignment(context, root);

        if (!context.can(Permission.readSubmission, course)) {
            return null;
        }

        return DBSubmission.countDocuments({
            assignmentId: root.id,
            submittedDate: { $exists: true },
        });
    }

    @FieldResolver((type) => Number, opt)
    public async unapprovedSubmissionCount(
        @Root() root: IAssignment,
        @Ctx() context: RequestContext
    ) {
        const course = await this.retrieveCourseFromAssignment(context, root);

        if (!context.can(Permission.readSubmission, course)) {
            return null;
        }

        if (!(await this.hasGrading(root))) {
            return null;
        }

        return DBSubmission.countDocuments({
            assignmentId: root.id,
            isApproved: { $ne: true },
            submittedDate: { $exists: true },
        });
    }

    @FieldResolver((type) => Boolean)
    public async hasGrading(@Root() root: IAssignment) {
        return Boolean(root?.assessmentType);
    }

    @FieldResolver((type) => [GradingScheme])
    public async gradingSchemes(
        @Root() root: IAssignment,
        @Ctx() context: RequestContext
    ) {
        const course = await this.retrieveCourseFromAssignment(context, root);
        if (!context.can(Permission.updateCourse, course)) {
            return [];
        }
        return DBGradingScheme.find({
            organizationId: context?.organization?._id,
        });
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

    private _computeTimeSpent(submission: ISubmission): number {
        const defaultDifference = 1000 * 60 * 5; // if a student is inactive for >10 minutes, we assume the student spent 5 minutes on the assignment
        const maximumDifference = 1000 * 60 * 10; // 10 minutes difference is allowed

        if (!submission.submittedDate) {
            throw new Error(
                "Cannot compute time spent on a submission that is not submitted yet."
            );
        }
        // get the timestamps
        const timestamps = submission.studentActivityTimestamps || [];
        if (timestamps.length === 0) {
            // push the created date
            timestamps.push(submission.createdAt.getTime());
            // push the submitted date
            timestamps.push(submission.submittedDate.getTime());
        }
        // sort the timestamp array
        const sortedTimestamps = timestamps.sort();

        // compute the total by adding the differences
        let total = 0;
        for (let i = 0; i < sortedTimestamps.length - 1; i += 1) {
            const diff = sortedTimestamps[i + 1] - sortedTimestamps[i];
            if (diff > maximumDifference) {
                total += defaultDifference;
            } else {
                total += diff;
            }
        }

        return total;
    }

    private async _computeScoringActions(
        submission: ISubmission,
        assignment: IAssignment,
        context: RequestContext
    ) {
        if (!assignment || !submission) {
            return null;
        }
        const blocks = await DBBlock.find({
            assignmentId: assignment?.id,
        });

        for (const block of blocks) {
            if (block.type === BlockType.Text) {
                continue;
            }
            const answers =
                submission?.answers?.find((a) => a.blockId.equals(block.id))
                    ?.data || [];

            const actionIds = block?.actions;
            const actions = (
                (await DBAction.find({
                    blockId: block?._id,
                })) || []
            ).sort(
                (a, b) => actionIds?.indexOf(a._id) - actionIds?.indexOf(b._id)
            );

            //compute scoring actions and push them to the teacher feedback array
            let feedback = await computeBlockFeedback({
                assignment,
                submission,
                block,
                actions,
                input: answers,
                user: context.user,
            });

            // update the teacher feedback for this block in the submission
            const blockFeedback = submission.feedback?.find((f) =>
                f.blockId.equals(block._id)
            );
            if (!blockFeedback) {
                submission.feedback.push({
                    blockId: block._id,
                    ...feedback,
                });
            } else {
                Object.assign(blockFeedback, feedback);
            }
        }
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

    private createTitleStringForSearch(title: string) {
        if (!title.startsWith("{")) {
            return title;
        }
        const titleObj = JSON.parse(title);
        return Object.keys(titleObj)
            .map((key) => titleObj[key])
            .join(" ");
    }
}
