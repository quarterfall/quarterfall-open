import { ApolloError } from "apollo-server-express";
import { config } from "config";
import {
    CourseEventType,
    generateId,
    Permission,
    RoleType,
    ServerError,
} from "core";
import { DBCourse } from "db/Course";
import { DBRole } from "db/Role";
import { DBUser } from "db/User";
import { postEvent } from "event/Event";
import { log } from "Logger";
import {
    Arg,
    Authorized,
    Ctx,
    ID,
    Mutation,
    Resolver,
    UnauthorizedError,
} from "type-graphql";
import { RequestContext } from "../../RequestContext";
import { Course } from "./Course";

@Resolver(Course)
export class CourseEnrollmentResolver {
    @Authorized()
    @Mutation((returns) => Course)
    public async createEnrollmentCodeForCourse(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ) {
        const course = await context.loadById(DBCourse, id);
        if (!course) {
            throw new ApolloError(
                `Course with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        // verify that the user can update this course
        if (!context.can(Permission.updateCourse, course) || course.archived) {
            throw new UnauthorizedError();
        }

        // generate a new code
        course.enrollmentCode = generateId({
            length: 8,
            allowed: ["numbers", "lowercaseLetters"],
        });
        await course.save();

        log.notice(
            `Created enrollment code ${course.enrollmentCode} for course with id ${course.id}.`
        );

        return course;
    }

    @Authorized()
    @Mutation((returns) => Course)
    public async deleteEnrollmentCodeFromCourse(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ) {
        const course = await context.loadById(DBCourse, id);
        if (!course) {
            throw new ApolloError(
                `Course with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        // verify that the user can update this course
        if (!context.can(Permission.updateCourse, course) || course.archived) {
            throw new UnauthorizedError();
        }

        course.enrollmentCode = undefined;
        await course.save();

        log.notice(`Deleted enrollment code for course with id ${course.id}.`);

        return course;
    }

    @Mutation((returns) => Course)
    public async enrollToCourse(
        @Ctx() context: RequestContext,
        @Arg("enrollmentCode", (type) => String) enrollmentCode: string
    ) {
        const course = await DBCourse.findOne({ enrollmentCode });
        if (!course) {
            throw new ApolloError(
                `Course with enrollmentCode ${enrollmentCode} not found.`,
                ServerError.NotFound
            );
        }

        // verify that the user can update this course
        if (course?.archived || !course?.organizationId) {
            throw new UnauthorizedError();
        }

        const user = await DBUser.findById(context?.user?.id);

        if (!user) {
            throw new UnauthorizedError();
        }

        let organizationRole = await DBRole.findOne({
            organizationId: course.organizationId,
            role: RoleType.organizationStudent,
            subjectId: course.organizationId,
            userId: user?._id,
        });

        if (!organizationRole) {
            // add the user to the organization
            user.organizations = user.organizations || [];
            user.organizations.push(course.organizationId);
            await user.save();

            // switch to new organization
            context.res.cookie("currentOrganization", course.organizationId, {
                domain: config.domain,
            });

            // create the organization role
            organizationRole = await DBRole.create({
                organizationId: course.organizationId,
                role: RoleType.organizationStudent,
                subjectId: course.organizationId,
                userId: user?._id,
                active: true,
            });
        }

        organizationRole.active = true;

        const courseRole = await DBRole.findOne({
            organizationId: course.organizationId,
            role: RoleType.organizationStudent,
            subjectId: course?._id,
            userId: user?._id,
        });

        if (courseRole) {
            throw new ApolloError(
                `User already has role in course ${course?.id}`,
                ServerError.UserAlreadyHasRole
            );
        }

        // create the course role
        await DBRole.create({
            organizationId: course.organizationId,
            role: RoleType.courseStudent,
            subjectId: course?._id,
            userId: user?._id,
            active: true,
        });

        postEvent({
            type: CourseEventType.CourseUserAdded,
            organizationId: context?.organization?.id,
            subjects: [course?.id],
            data: {
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
                link: `/course/${course?.id}/students`,
            },
        });

        log.notice(
            `Enrolled student ${user?.firstName} ${user?.lastName} for course with id ${course.id}.`
        );

        return course;
    }
}
