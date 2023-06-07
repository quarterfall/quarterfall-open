import { ApolloError } from "apollo-server-express";
import {
    arrayMove,
    ModuleEventType,
    Permission,
    RoleType,
    ServerError,
} from "core";
import { DBAssignment } from "db/Assignment";
import { DBCourse, ICourse } from "db/Course";
import { DBModule, IModule } from "db/Module";
import { postEvent } from "event/Event";
import { Assignment } from "graphql/assignment/Assignment";
import { log } from "Logger";
import {
    copyModule,
    deleteModule,
    moduleCompleted,
    moduleIsOptional,
} from "operations/Module.operation";
import { RequestContext } from "RequestContext";
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
import { Course } from "../course/Course";
import { Module } from "./Module";
import { ModuleCreateInput } from "./ModuleCreate.input";
import { ModuleUpdateInput } from "./ModuleUpdate.input";

const opt = { nullable: true };

@Resolver(Module)
export class ModuleResolver {
    //
    // Queries
    //

    @Query((returns) => Module, opt)
    public async module(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ) {
        // retrieve the module and the course
        const module = await context.loadById(DBModule, id);
        if (!module) {
            throw new ApolloError(
                `Module with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        const course = await context.loadById(DBCourse, module.courseId);

        // check that the logged in user is allowed to read the course that this
        // module belongs to
        if (!context.can(Permission.readCourse, course)) {
            throw new UnauthorizedError();
        }
        return module;
    }

    @Authorized()
    @Mutation((returns) => Course)
    public async createModule(
        @Ctx() context: RequestContext,
        @Arg("courseId", (type) => ID) courseId: string,
        @Arg("input") input: ModuleCreateInput,
        @Arg("beforeIndex", (type) => Int, opt) beforeIndex?: number
    ) {
        // retrieve the course
        const course = await context.loadById(DBCourse, courseId);
        if (!course) {
            throw new ApolloError(
                `Course with id ${courseId} not found.`,
                ServerError.NotFound
            );
        }

        // check that the logged in user is allowed to change this course
        if (!context.can(Permission.updateCourse, course) || course.archived) {
            throw new UnauthorizedError();
        }

        // determine the index to store with the module
        const index =
            beforeIndex !== undefined
                ? beforeIndex - 0.5
                : Number.MAX_SAFE_INTEGER;

        // create the module
        const module = await new DBModule({
            courseId: course._id,
            index,
            ...input,
        }).save();

        // regenerate the indices for all the modules in the course
        const modules = await DBModule.find({
            courseId: course._id,
        }).sort("index");
        await Promise.all(
            modules.map(async (a, i) => {
                a.index = i;
                await a.save();
            })
        );
        context.prime(DBModule, modules);

        postEvent({
            type: ModuleEventType.ModuleCreated,
            organizationId: context?.organization?.id,
            subjects: [course?.id],
            data: {
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

        log.notice(
            `Created module "${module.title}" (${module.id}) in course "${course.title}" (${course.id}).`,
            input
        );

        // return the course
        return course;
    }

    @Authorized()
    @Mutation((returns) => Module)
    public async updateModule(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("input") input: ModuleUpdateInput
    ) {
        // retrieve the module and the course
        const module = await context.loadById(DBModule, id);
        if (!module) {
            throw new ApolloError(
                `Module with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        const course = await context.loadById(DBCourse, module.courseId);

        // check that the logged in user is allowed to change the course that this
        // module belongs to
        if (!context.can(Permission.updateCourse, course) || course?.archived) {
            throw new UnauthorizedError();
        }

        const newModule = await DBModule.findByIdAndUpdate(id, input, {
            new: true,
        });

        postEvent({
            type: ModuleEventType.ModuleUpdated,
            organizationId: context?.organization?.id,
            subjects: [course?.id],
            data: {
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

        log.notice(`Module "${module.title}" (${module.id}) updated.`, input);

        return newModule;
    }

    @Authorized()
    @Mutation((returns) => Course)
    public async copyModule(
        @Ctx() context: RequestContext,
        @Arg("courseId", (type) => ID, opt) courseId: string,
        @Arg("id", (type) => ID) id: string
    ) {
        const module = await context.loadById(DBModule, id);

        // if the module doesn't exist, throw an error.
        if (!module) {
            throw new ApolloError(`Module with id ${id} not found.`);
        }

        // retrieve the associated course
        const course = await context.loadById(
            DBCourse,
            courseId || module.courseId
        );
        if (!course) {
            throw new ApolloError(
                `Course with id ${module.courseId} not found.`
            );
        }

        // check that the used can update the course and that the course is not archived
        if (!context.can(Permission.updateCourse, course) || course.archived) {
            throw new UnauthorizedError();
        }

        // make a copy of the module
        await copyModule(module, courseId ? course._id : undefined);

        log.notice(
            `Module "${module.title}" (${module.id}) copied to course "${course.title}" (${course.id}).`
        );

        // return the course
        return course;
    }

    @Authorized()
    @Mutation((returns) => Course)
    public async mergeModule(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("targetIndex", (type) => Int, opt) targetIndex?: number
    ) {
        // retrieve the module
        const module = await context.loadById(DBModule, id);
        if (!module) {
            throw new ApolloError(
                `Module with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        // retrieve the course
        const course = await context.loadById(DBCourse, module.courseId);
        if (!course) {
            throw new ApolloError(
                `Course with id ${module.courseId} not found.`,
                ServerError.NotFound
            );
        }

        // check that the logged in user is allowed to change this course
        if (!context.can(Permission.updateCourse, course) || course.archived) {
            throw new UnauthorizedError();
        }

        // index is previous module by default
        if (targetIndex === undefined) {
            targetIndex = module.index - 1;
        }

        // find the target module
        const targetModule = await DBModule.findOne({
            index: targetIndex,
            courseId: module.courseId,
        });

        if (!targetModule) {
            throw new ApolloError(
                `Target module for merge with module with id ${id} not found.`
            );
        }

        // find all the assignments belonging to the source module
        const sourceAssignments = await DBAssignment.find({
            moduleId: module.id,
        });

        // find the last index
        const lastIndex =
            (await DBAssignment.countDocuments({
                moduleId: targetModule.id,
            })) - 1;

        // update the index and module id of the source assignments
        await Promise.all(
            sourceAssignments.map(async (assignment) => {
                assignment.moduleId = targetModule.id;
                assignment.index += lastIndex + 1; // place the assignments at the end
                return assignment.save();
            })
        );

        // finally, delete this module
        await deleteModule(module);

        log.notice(
            `Module "${module.title}" (${module.id}) merged with module "${targetModule.title}" (${targetModule.id}).`
        );

        return course;
    }

    @Authorized()
    @Mutation((returns) => Course)
    public async deleteModule(
        @Arg("id", (type) => ID) id: string,
        @Ctx() context: RequestContext
    ) {
        // retrieve the module
        const module = await context.loadById(DBModule, id);
        if (!module) {
            throw new ApolloError(
                `Module with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        // retrieve the course
        const course = await context.loadById(DBCourse, module.courseId);
        if (!course) {
            throw new ApolloError(
                `Course with id ${module.courseId} not found.`,
                ServerError.NotFound
            );
        }

        // check that the logged in user is allowed to change this course
        if (!context.can(Permission.updateCourse, course) || course.archived) {
            throw new UnauthorizedError();
        }

        // delete the module
        await deleteModule(module);

        postEvent({
            type: ModuleEventType.ModuleDeleted,
            organizationId: context?.organization?.id,
            subjects: [course?.id],
            data: {
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

        log.notice(`Module "${module.title}" (${module.id}) deleted.`, module);

        // return the course
        return course;
    }

    @Authorized()
    @Mutation((returns) => Course)
    public async moveModuleToIndex(
        @Ctx() context: RequestContext,
        @Arg("index", (type) => Int) index: number,
        @Arg("courseId", (type) => ID) courseId: string,
        @Arg("moduleId", (type) => ID) moduleId: string
    ): Promise<ICourse> {
        // retrieve the course
        const course = await context.loadById(DBCourse, courseId);

        // if the course doesn't exist, throw an error
        if (!course) {
            throw new ApolloError(
                `Course with id ${courseId} not found.`,
                ServerError.NotFound
            );
        }

        // check that the logged in user is allowed to change this course
        if (!context.can(Permission.updateCourse, course) || course.archived) {
            throw new UnauthorizedError();
        }

        // retrieve all modules and sort them by index
        const modules = await DBModule.find({
            courseId: course._id,
        }).sort("index");

        const oldIndex = modules.findIndex((value) =>
            value._id.equals(moduleId)
        );

        // check that the old index is valid
        if (oldIndex < 0 || oldIndex >= modules.length) {
            throw new ApolloError(`Invalid existing index ${oldIndex}.`);
        }

        // check that the new index is valid
        if (index < 0 || index > modules.length) {
            throw new ApolloError(`Invalid index ${index}.`);
        }

        // move the module
        arrayMove({
            array: modules,
            oldIndex,
            newIndex: index,
        });

        // update the module indices
        await Promise.all(
            modules.map(async (m, i) => {
                m.index = i;
                await m.save();
            })
        );

        log.debug(
            `Module (${module.id}) moved to index ${index} in course ${course.title} (${course.id}).`
        );

        return course;
    }

    @FieldResolver((type) => Course)
    public course(@Ctx() context: RequestContext, @Root() root: IModule) {
        return context.loadById(DBCourse, root.courseId);
    }

    @FieldResolver((type) => [Assignment])
    public async assignments(
        @Ctx() context: RequestContext,
        @Root() root: IModule
    ) {
        const course = await context.loadById(DBCourse, root.courseId);

        // retrieve the assignments
        const assignments = await DBAssignment.find({
            moduleId: root.id,
        }).sort("index");

        // remap the indices for backward compatibility and to ensure unique index values
        // log a warning message for missing indices
        assignments.map((assignment, index) => {
            if (assignment.index !== index) {
                log.warning(
                    `Enforced index of assignment with id ${assignment._id} from ${assignment.index} to ${index}.`
                );
            }
            assignment.index = index;
        });

        if (context.getRole(course) === RoleType.courseStudent) {
            return assignments.filter((a) => a.visible);
        } else {
            return assignments;
        }
    }

    @FieldResolver((type) => Boolean)
    public async completed(
        @Ctx() context: RequestContext,
        @Root() root: IModule
    ) {
        return context.user ? moduleCompleted(root.id, context.user.id) : false;
    }

    @FieldResolver((type) => Boolean, opt)
    public async isOptional(
        @Ctx() context: RequestContext,
        @Root() root: IModule
    ) {
        const course = await this.course(context, root);

        if (!context.can(Permission.readCourse, course)) {
            return null;
        }
        return moduleIsOptional(root.id);
    }
}
