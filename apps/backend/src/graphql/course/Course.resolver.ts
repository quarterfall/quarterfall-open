import { ApolloError } from "apollo-server-express";
import {
    AssignmentEventType,
    BlockEventType,
    CourseEventType,
    generateId,
    ModuleEventType,
    Permission,
    RoleType,
    ServerError,
    SubmissionEventType,
} from "core";
import { DBAnalyticsBlock, IAnalyticsBlock } from "db/AnalyticsBlock";
import { DBAssignment } from "db/Assignment";
import { DBCourse, ICourse } from "db/Course";
import { DBEvent } from "db/Event";
import { DBModule } from "db/Module";
import { DBRole } from "db/Role";
import { DBUser, IUser } from "db/User";
import { Event } from "graphql/event/Event";
import { log } from "Logger";
import { copyCourse, deleteCourse } from "operations/Course.operation";
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
import { postEvent } from "../../event/Event";
import { RequestContext } from "../../RequestContext";
import { Module } from "../module/Module";
import { Course } from "./Course";
import { CourseCreateInput } from "./CourseCreate.input";
import { CourseImportInput } from "./CourseImport.input";
import { CourseUpdateInput } from "./CourseUpdate.input";
import mongoose = require("mongoose");

const opt = { nullable: true };

const allowedEventTypes = Object.values({
    ...AssignmentEventType,
    ...SubmissionEventType,
    ...ModuleEventType,
    ...BlockEventType,
});

@Resolver(Course)
export class CourseResolver {
    //
    // Queries
    //

    @Authorized()
    @Query((returns) => Course, opt)
    public async course(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ) {
        const course = await context.loadById(DBCourse, id);
        if (!course) {
            return null;
        }
        // verify that the user is allowed to see the course
        if (
            (course.userId && !context.user?._id.equals(course.userId)) ||
            (course.organizationId &&
                !context.can(Permission.readCourse, course))
        ) {
            throw new UnauthorizedError();
        }

        return course;
    }

    @Query((returns) => Course, opt)
    public async courseByCode(
        @Ctx() context: RequestContext,
        @Arg("code") code: string
    ) {
        return DBCourse.findOne({ publicCode: code.toUpperCase() });
    }

    //
    // Mutations
    //

    @Authorized()
    @Mutation((returns) => Course)
    public async createCourse(
        @Ctx() context: RequestContext,
        @Arg("input") input: CourseCreateInput,
        @Arg("defaultModuleName", opt) defaultModuleName?: string
    ): Promise<ICourse> {
        const user = context.user!;
        const organization = context.organization;

        // verify that the user is allowed to create a course
        if (!context.can(Permission.createCourse)) {
            throw new UnauthorizedError();
        }

        // create the course
        const course = await new DBCourse({
            organizationId: organization?._id,
            userId: !organization ? context.user?._id : undefined,
            analyticsBlocks: [],
            ...input,
        }).save();

        if (defaultModuleName) {
            // create the module
            const module = await new DBModule({
                courseId: course._id,
                index: 0,
                title: defaultModuleName,
            }).save();
            log.notice(
                `Created module "${module.title}" (${module.id}) in course "${course.title}" (${course.id}).`
            );
        }

        if (organization) {
            // create the course analytics block defaults
            const analyticsBlocks = await DBAnalyticsBlock.find({
                _id: {
                    $in: organization.courseAnalyticsBlockDefaults || [],
                },
            });

            // create a copy of the analytics blocks for the course, module, assignment and student analytics pages
            const copyAnalyticsBlock = async (block: IAnalyticsBlock) => {
                block._id = new mongoose.Types.ObjectId();
                block.isNew = true;
                block.subjectId = course._id;
                await block.save();
                return block._id;
            };

            course.analyticsBlocks = await Promise.all(
                analyticsBlocks.map(copyAnalyticsBlock)
            );

            await course.save();
        }

        // create an admin role for the user that created the course

        await new DBRole({
            organizationId: organization?._id,
            subjectId: course._id,
            role: RoleType.courseAdmin,
            userId: context.user?.id,
            active: true,
        }).save();

        // post a course created event
        postEvent({
            type: CourseEventType.CourseCreated,
            organizationId: organization?.id,
            subjects: [course.id],
            data: {
                course: {
                    id: course.id,
                    title: course.title,
                    code: course.code,
                    description: course.description,
                },
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    emailAddress: user.emailAddress,
                },
                organization: organization
                    ? {
                          id: organization?.id,
                          name: organization?.name,
                      }
                    : undefined,
            },
            metadata: {
                link: `/course/${course.id}/content`,
            },
        });

        if (organization) {
            log.notice(
                `A new course has been created with title "${course.title}" (${course.id}) in organization "${context.organization?.name}" (${context.organization?.id}) by user "${user.emailAddress}" (${user.id}).`
            );
        } else {
            log.notice(
                `A new course has been created with title "${course.title}" (${course.id}) by user "${user.emailAddress}" (${user.id}).`
            );
        }

        // return the created course
        return course;
    }

    @Authorized()
    @Mutation((returns) => Course)
    public async updateCourse(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("input") input: CourseUpdateInput
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

        // verify that the user can archive this course
        if (
            input.archived !== undefined &&
            !context.can(Permission.deleteCourse, course)
        ) {
            throw new UnauthorizedError();
        }

        // verify that the user can change demo course status
        if (input.demo !== undefined && !context.isSysAdmin) {
            throw new UnauthorizedError();
        }

        if (input.archived) {
            // remove public key from all assignments.
            const modules = await DBModule.find({ courseId: course._id });
            for (const module of modules) {
                const assignments = await DBAssignment.find({
                    moduleId: module.id,
                });
                for (const assignment of assignments) {
                    assignment.publicKey = undefined;
                    assignment.save();
                }
            }
            if (!course?.endDate || course.endDate.getTime() > Date.now()) {
                // set the end date to now
                input.endDate = new Date();
            }
        }

        log.notice(`Course with id ${course.id} updated.`, input);

        return DBCourse.findByIdAndUpdate(course._id, input, { new: true });
    }

    @Authorized()
    @Mutation((returns) => Course)
    public async importCourse(
        @Ctx() context: RequestContext,
        @Arg("input") input: CourseImportInput
    ): Promise<ICourse | null> {
        const { code, startDate, endDate } = input;
        // find the course by code
        const course = await DBCourse.findOne({
            publicCode: code.toUpperCase(),
        });
        if (!course) {
            throw new ApolloError(
                `Course with code ${code} not found.`,
                ServerError.NotFound
            );
        }
        return this.duplicateCourse(
            context,
            {
                startDate,
                endDate,
            },
            course.id
        );
    }

    @Authorized()
    @Mutation((returns) => Course)
    public async publishCourseToLibrary(
        @Ctx() context: RequestContext,
        @Arg("courseId", (type) => ID) courseId: string
    ): Promise<ICourse | null> {
        // only system admins can publish a course to the library
        if (!context.isSysAdmin) {
            throw new UnauthorizedError();
        }
        const user = context.user!;
        // retrieve the course
        const course = await context.loadById(DBCourse, courseId);
        if (!course) {
            throw new ApolloError(
                `Course with id ${courseId} not found.`,
                ServerError.NotFound
            );
        }

        // create the course copy
        const courseCopy = await copyCourse(course);

        // turn it into a library course
        courseCopy.library = true;
        await courseCopy.save();

        // post a course published in library event
        postEvent({
            type: CourseEventType.CoursePublishedInLibrary,
            subjects: [course.id],
            data: {
                source: {
                    id: course.id,
                    title: course.title,
                    code: course.code,
                    description: course.description,
                },
                course: {
                    id: courseCopy.id,
                    title: courseCopy.title,
                    code: courseCopy.code,
                    description: courseCopy.description,
                },
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    emailAddress: user.emailAddress,
                },
            },
            metadata: {
                link: `/course/${course.id}/content`,
            },
        });

        log.notice(
            `Course "${course.title}" (${course.id}) has been published in the library under ${courseCopy.id}.`
        );

        // return the copy of the course
        return courseCopy;
    }

    @Authorized()
    @Mutation((returns) => Course)
    public async duplicateCourse(
        @Ctx() context: RequestContext,
        @Arg("input") input: CourseCreateInput,
        @Arg("courseId", (type) => ID) courseId: string
    ): Promise<ICourse | null> {
        const organization = context.organization!;
        const user = context.user!;
        // retrieve the course
        const course = await context.loadById(DBCourse, courseId);
        if (!course) {
            throw new ApolloError(
                `Course with id ${courseId} not found.`,
                ServerError.NotFound
            );
        }

        // verify that the user is allowed to create a course
        if (!context.can(Permission.createCourse)) {
            throw new UnauthorizedError();
        }
        // create the course copy
        const courseCopy = await copyCourse(course);
        await courseCopy.updateOne({
            ...input,
        });

        // set the organization id and make sure the copy is not a demo course
        courseCopy.organizationId = organization._id;
        await courseCopy.save();

        // create an admin role for the user that created the course
        await new DBRole({
            organizationId: organization._id,
            subjectId: courseCopy._id,
            role: RoleType.courseAdmin,
            userId: context.user?.id,
            active: true,
        }).save();

        // post a course created event
        postEvent({
            type: CourseEventType.CourseCreated,
            organizationId: organization?.id,
            subjects: [course.id],
            data: {
                source: {
                    id: course.id,
                    title: course.title,
                    code: course.code,
                    description: course.description,
                },
                course: {
                    id: courseCopy.id,
                    title: courseCopy.title,
                    code: courseCopy.code,
                    description: courseCopy.description,
                },
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    emailAddress: user.emailAddress,
                },
                organization: organization
                    ? {
                          id: organization.id,
                          name: organization.name,
                      }
                    : undefined,
            },
            metadata: {
                link: `/course/${course.id}/content`,
            },
        });

        log.notice(
            `Course "${course.title}" (${course.id}) has been duplicated in organization "${context.organization?.name}" (${context.organization?.id}).`,
            input
        );

        // return the copy of the course
        return courseCopy;
    }

    @Authorized()
    @Mutation((returns) => Course)
    public async deleteCourse(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ): Promise<ICourse> {
        // retrieve the course
        const course = await context.loadById(DBCourse, id);
        if (!course) {
            throw new ApolloError(
                `Course with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        // check that the logged in user is allowed to delete this course
        if (!context.can(Permission.deleteCourse, course)) {
            throw new UnauthorizedError();
        }

        // delete the course
        await deleteCourse(course);

        log.notice(
            `Course "${course.title}" (${course.id}) has been deleted.`,
            course.toJSON()
        );

        // return the course
        return course;
    }

    @Authorized()
    @Mutation((returns) => Course)
    public async publishCourse(
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
        course.publicCode = generateId({
            length: 6,
            allowed: ["numbers", "uppercaseLetters"],
        });
        await course.save();

        log.notice(
            `Course with id ${course.id} published with code ${course.publicCode}.`
        );

        return course;
    }

    @Authorized()
    @Mutation((returns) => Course)
    public async unpublishCourse(
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

        course.publicCode = undefined;
        await course.save();

        log.notice(`Course with id ${course.id} unpublished.`);

        return course;
    }

    @Authorized()
    @FieldResolver((type) => [Module], opt)
    public async modules(
        @Root() root: ICourse,
        @Ctx() context: RequestContext
    ) {
        // retrieve the modules
        let modules = await DBModule.find({
            courseId: root._id,
        }).sort("index");

        // remap the indices for backward compatibility and to ensure unique index values
        // log a warning message for missing indices
        modules.map((module, index) => {
            if (module.index !== index) {
                log.warning(
                    `Enforced index of module with id ${module._id} from ${module.index} to ${index}.`
                );
            }
            module.index = index;
        });
        context.prime(DBModule, modules);

        // filter out empty and non-visible modules for students.
        if (context.getRole(root) === RoleType.courseStudent) {
            const assignments = await DBAssignment.find({
                moduleId: { $in: modules.map((m) => m._id) },
            });
            modules = modules.filter(
                (m) =>
                    m.visible &&
                    assignments.find((a) => a.moduleId.equals(m._id))
            );
        }

        return modules;
    }

    @FieldResolver((type) => RoleType, opt)
    public role(
        @Root() root: ICourse,
        @Ctx() context: RequestContext
    ): RoleType | undefined {
        return context.getRole(root);
    }

    @FieldResolver((type) => RoleType, opt)
    public async user(
        @Root() root: ICourse,
        @Arg("id", (type) => ID) id: string,
        @Ctx() context: RequestContext
    ): Promise<IUser | null> {
        if (!context.can(Permission.readCourseUser, root)) {
            return null;
        }
        // find the user and its role
        const role = await DBRole.findOne({
            subjectId: root._id,
            userId: id,
            active: true,
        });
        if (!role) {
            return null;
        }
        return context.loadById(DBUser, id);
    }

    @FieldResolver((type) => [Permission])
    public permissions(@Root() root: ICourse, @Ctx() context: RequestContext) {
        return context.getPermissions(root);
    }

    @FieldResolver((type) => [Event])
    public async events(@Root() root: ICourse, @Ctx() context: RequestContext) {
        const events = await DBEvent.find({
            subjects: {
                $in: [root?.id],
            },
            organizationId: context.organization?.id,
            type: {
                $in: allowedEventTypes,
            },
        })
            .sort({ createdAt: "desc" })
            .limit(5);
        return events;
    }
}
