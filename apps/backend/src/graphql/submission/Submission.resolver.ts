import {
    NotificationType,
    Permission,
    RoleType,
    ServerError,
    SubmissionEventType,
} from "core";

import { ApolloError } from "apollo-server-express";
import { config, submissionKeyString } from "config";
import { DBAssignment } from "db/Assignment";
import { DBCourse, ICourse } from "db/Course";
import { DBModule } from "db/Module";
import { DBNotification } from "db/Notification";
import { DBRole } from "db/Role";
import { DBSubmission, ISubmission } from "db/Submission";
import { DBUser } from "db/User";
import { postEvent } from "event/Event";
import { User } from "graphql/user/User";
import { log } from "Logger";

import { RequestContext } from "RequestContext";
import { exchangeCode } from "Security";
import { deleteFiles } from "Storage";
import {
    Arg,
    Authorized,
    Ctx,
    FieldResolver,
    ID,
    Mutation,
    Query,
    Resolver,
    Root,
    UnauthorizedError,
} from "type-graphql";
import { Assignment } from "../assignment/Assignment";
import { Submission } from "./Submission";
import { SubmissionUpdateInput } from "./SubmissionUpdate.input";

const opt = { nullable: true };

@Resolver(Submission)
export class SubmissionResolver {
    @Query((returns) => Submission, opt)
    public async submission(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ) {
        const submission = await context.loadById(DBSubmission, id);
        if (!submission) {
            throw new ApolloError(
                `Submission with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        // check if this is the user's submission (students can always see their own
        // submission)
        if (!submission.userId?.equals(context.user?._id)) {
            const course = await this.retrieveCourseFromSubmission(
                context,
                submission
            );

            // check that the logged in user is allowed to read this submission
            if (!context.can(Permission.readSubmission, course)) {
                throw new UnauthorizedError();
            }
        }

        return submission;
    }

    @Authorized()
    @Mutation((returns) => Submission)
    public async updateSubmission(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("input") input: SubmissionUpdateInput
    ) {
        // retrieve the submission
        const submission = await context.loadById(DBSubmission, id);
        if (!submission) {
            throw new ApolloError(
                `Submission with id ${id} not found.`,
                ServerError.NotFound
            );
        }
        const assignment = await context.loadById(
            DBAssignment,
            submission.assignmentId
        );
        const course = await this.retrieveCourseFromSubmission(
            context,
            submission
        );

        // check that the logged in user is allowed to change this submission
        if (
            !context.can(Permission.updateSubmission, course) ||
            course?.archived
        ) {
            throw new UnauthorizedError();
        }

        const newSubmission = await DBSubmission.findByIdAndUpdate(id, input, {
            new: true,
        });

        const createSubmissionNotification = async (type: NotificationType) => {
            const hasNotification = await DBNotification.countDocuments({
                organizationId: context.organization?._id,
                actorId: context.user?._id,
                subjectId: newSubmission?._id,
                receiverId: newSubmission?.userId,
                type,
            });
            if (!hasNotification) {
                const link = `/student/assignment/${assignment?.id}`;
                // create a notification if it doesn't exist yet
                const notification = new DBNotification({
                    organizationId: context.organization?._id,
                    actorId: context.user?.id,
                    subjectId: newSubmission?._id,
                    receiverId: newSubmission?.userId,
                    type,
                    link,
                    metadata: {
                        teacher: `${context.user?.firstName} ${context.user?.lastName}`,
                        assignment: assignment?.title,
                    },
                });
                await notification.save();
            }
        };

        if (
            (input.comment && input.comment !== submission.comment) ||
            (input.rating && input.rating !== submission.rating)
        ) {
            await createSubmissionNotification(
                NotificationType.CommentRatingReceived
            );
        }
        if (input.sticker && input.sticker !== submission.sticker) {
            await createSubmissionNotification(
                NotificationType.StickerReceived
            );
        }

        log.notice(
            `Submission with id ${submission.id} has been updated.`,
            input
        );

        return newSubmission;
    }

    @Authorized()
    @Mutation((returns) => Submission)
    public async reopenSubmission(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ) {
        // retrieve the submission
        const submission = await context.loadById(DBSubmission, id);
        if (!submission) {
            throw new ApolloError(
                `Submission with id ${id} not found.`,
                ServerError.NotFound
            );
        }
        const assignment = await context.loadById(
            DBAssignment,
            submission.assignmentId
        );

        const course = await this.retrieveCourseFromSubmission(
            context,
            submission
        );

        // check that the logged in user is allowed to update submissions in
        // this course
        if (
            !course ||
            !context.can(Permission.updateSubmission, course) ||
            course?.archived
        ) {
            throw new UnauthorizedError();
        }

        // reopen the submission by setting the submitted date to undefined and clearing the completed blocks list
        submission.submittedDate = undefined;
        submission.comment = undefined;
        submission.rating = undefined;
        submission.sticker = undefined;
        submission.completedBlocks = [];
        await submission.save();

        const link = `/student/assignment/${assignment?.id}`;

        // create a notification
        await new DBNotification({
            organizationId: context.organization?._id,
            actorId: context.user?.id,
            subjectId: assignment?._id,
            receiverId: submission?.userId,
            type: NotificationType.SubmissionReopened,
            link,
            metadata: {
                teacher: `${context.user?.firstName} ${context.user?.lastName}`,
                assignment: assignment?.title,
            },
        }).save();

        const student = await DBUser.findById(submission?.userId);

        course.analyticsNeedRecompute = true;
        await course.save();

        postEvent({
            type: SubmissionEventType.SubmissionReopened,
            organizationId: context?.organization?.id,
            subjects: [course?.id, submission?.id],
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

        // return the updated submission
        return submission;
    }

    @Authorized()
    @Mutation((returns) => [Submission])
    public async reopenSubmissions(
        @Ctx() context: RequestContext,
        @Arg("submissionIds", (type) => [ID]) submissionIds: string[]
    ) {
        const submissions: ISubmission[] = [];
        await Promise.all(
            submissionIds.map(async (submissionId) => {
                const submission = await this.reopenSubmission(
                    context,
                    submissionId
                );
                submissions.push(submission);
            })
        );
        return submissions;
    }

    @Mutation((returns) => Assignment)
    public async resetAnonymousSubmission(
        @Ctx() context: RequestContext,
        @Arg("publicKey", (type) => String) publicKey: string
    ) {
        const id = this.exchangeSubmissionKey(context, publicKey);
        // retrieve the submission
        const submission = await DBSubmission.findById(id);

        if (!submission) {
            throw new ApolloError(
                `Submission with key ${id} not found.`,
                ServerError.NotFound
            );
        }

        const assignment = await context.loadById(
            DBAssignment,
            submission.assignmentId
        );

        if (publicKey !== assignment?.publicKey) {
            throw new UnauthorizedError();
        }

        // delete the submission
        await submission.delete();

        // remove the cookie
        context.res.clearCookie(`${submissionKeyString}${publicKey}`);
        context.res.cookie(`${submissionKeyString}${publicKey}`, "", {
            expires: new Date(0),
            domain: config.domain,
        });

        // return the deleted submission
        return assignment;
    }

    @Authorized()
    @Mutation((returns) => Submission)
    public async deleteSubmission(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ) {
        // retrieve the submission
        const submission = await context.loadById(DBSubmission, id);
        if (!submission) {
            throw new ApolloError(
                `Submission with id ${id} not found.`,
                ServerError.NotFound
            );
        }
        const assignment = await context.loadById(
            DBAssignment,
            submission.assignmentId
        );

        const course = await this.retrieveCourseFromSubmission(
            context,
            submission
        );

        // check that the logged in user is allowed to delete submissions in
        // this course
        if (
            !course ||
            !context.can(Permission.deleteSubmission, course) ||
            course?.archived
        ) {
            throw new UnauthorizedError();
        }

        // delete any files associated with the submission
        await deleteFiles(`submission/${submission?.id}/files`);

        // delete the submission
        await submission.delete();

        if (context.user?.id) {
            // create a notification
            const link = `/student/assignment/${assignment?.id}`;
            await new DBNotification({
                organizationId: context.organization?._id,
                actorId: context.user?.id,
                subjectId: assignment?._id,
                receiverId: submission?.userId,
                type: NotificationType.SubmissionDeleted,
                link,
                metadata: {
                    teacher: `${context.user?.firstName} ${context.user?.lastName}`,
                    assignment: assignment?.title,
                },
            }).save();

            const student = await DBUser.findById(submission?.userId);

            course.analyticsNeedRecompute = true;
            await course.save();

            postEvent({
                type: SubmissionEventType.SubmissionDeleted,
                organizationId: context?.organization?.id,
                subjects: [course?.id, submission?.id],
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
                    link: `/assignment/${assignment?.id}`,
                },
            });
        }

        // return the deleted submission
        return submission;
    }

    @Authorized()
    @Mutation((returns) => [Submission])
    public async deleteSubmissions(
        @Ctx() context: RequestContext,
        @Arg("submissionIds", (type) => [ID]) submissionIds: string[]
    ) {
        const submissions: ISubmission[] = [];
        await Promise.all(
            submissionIds.map(async (submissionId) => {
                const submission = await this.deleteSubmission(
                    context,
                    submissionId
                );
                submissions.push(submission);
            })
        );
        return submissions;
    }

    @Authorized()
    @Mutation((returns) => Submission)
    public async unapproveSubmission(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ) {
        // retrieve the submission
        const submission = await context.loadById(DBSubmission, id);
        if (!submission) {
            throw new ApolloError(
                `Submission with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        const course = await this.retrieveCourseFromSubmission(
            context,
            submission
        );

        // check that the logged in user is allowed to update submissions in
        // this course
        if (
            !course ||
            !context.can(Permission.updateSubmission, course) ||
            course?.archived
        ) {
            throw new UnauthorizedError();
        }

        submission.isApproved = false;

        await submission.save();

        return submission;
    }

    @Authorized()
    @Mutation((returns) => [Submission])
    public async unapproveSubmissions(
        @Ctx() context: RequestContext,
        @Arg("submissionIds", (type) => [ID]) submissionIds: string[]
    ) {
        const submissions: ISubmission[] = [];
        await Promise.all(
            submissionIds.map(async (submissionId) => {
                const submission = await this.unapproveSubmission(
                    context,
                    submissionId
                );
                submissions.push(submission);
            })
        );
        return submissions;
    }

    @Authorized()
    @Mutation((returns) => Submission)
    public async approveSubmission(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ) {
        // retrieve the submission
        const submission = await context.loadById(DBSubmission, id);
        if (!submission) {
            throw new ApolloError(
                `Submission with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        const assignment = await context.loadById(
            DBAssignment,
            submission.assignmentId
        );

        const course = await this.retrieveCourseFromSubmission(
            context,
            submission
        );

        // check that the logged in user is allowed to update submissions in
        // this course
        if (
            !course ||
            !context.can(Permission.updateSubmission, course) ||
            course?.archived
        ) {
            throw new UnauthorizedError();
        }

        submission.isApproved = !submission.isApproved;

        if (submission.isApproved) {
            const link = `/student/assignment/${assignment?.id}`;
            // create a notification if the submission is approved
            await new DBNotification({
                organizationId: context.organization?._id,
                actorId: context.user?.id,
                subjectId: assignment?._id,
                receiverId: submission?.userId,
                type: NotificationType.SubmissionApproved,
                link,
                metadata: {
                    assignment: assignment?.title,
                    grade: submission?.grade,
                },
            }).save();

            const student = await DBUser.findById(submission?.userId);

            course.analyticsNeedRecompute = true;
            await course.save();

            postEvent({
                type: SubmissionEventType.SubmissionApproved,
                organizationId: context?.organization?.id,
                subjects: [course?.id, submission?.id],
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
                    link: `/grading/${submission?.id}`,
                },
            });
        }

        return submission.save();
    }

    @FieldResolver((type) => Assignment)
    public assignment(
        @Ctx() context: RequestContext,
        @Root() root: ISubmission
    ) {
        return context.loadById(DBAssignment, root.assignmentId);
    }

    @FieldResolver((type) => User, opt)
    public student(@Ctx() context: RequestContext, @Root() root: ISubmission) {
        return context.loadById(DBUser, root.userId);
    }

    @FieldResolver((type) => Boolean, opt)
    public async needsAssessment(@Root() root: ISubmission) {
        return Boolean(
            root.feedback?.filter(
                (f) => f?.score === undefined || f?.score === null
            ).length > 0
        );
    }

    @FieldResolver((type) => Boolean, opt)
    public async isTeacherTest(
        @Ctx() context: RequestContext,
        @Root() root: ISubmission
    ) {
        const course = await this.retrieveCourseFromSubmission(context, root);
        const role = await DBRole.findOne({
            userId: root?.userId,
            role: { $ne: RoleType.courseStudent },
            subjectId: course?._id,
        });
        return !!role;
    }

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

    private async retrieveCourseFromSubmission(
        context: RequestContext,
        submission?: ISubmission | null
    ): Promise<ICourse | null> {
        if (!submission) {
            return null;
        }

        // retrieve the course via the assignment and module
        const assignment = await context.loadById(
            DBAssignment,
            submission.assignmentId
        );
        const module = await context.loadById(DBModule, assignment?.moduleId);
        return context.loadById(DBCourse, module?.courseId);
    }
}
