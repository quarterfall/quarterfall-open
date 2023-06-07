import { ApolloError } from "apollo-server-express";
import { AnalyticsType, arrayMove, Permission, ServerError } from "core";
import { DBAnalyticsBlock, IAnalyticsBlock } from "db/AnalyticsBlock";
import { DBAnalyticsBlockCache } from "db/AnalyticsBlockCache";
import { DBCourse, ICourse } from "db/Course";
import { AnalyticsBlock } from "graphql/analyticsblock/AnalyticsBlock";
import { AnalyticsBlockUpdateInput } from "graphql/analyticsblock/AnalyticsBlockUpdate.input";
import { log } from "Logger";
import { RequestContext } from "RequestContext";
import {
    Arg,
    Authorized,
    Ctx,
    FieldResolver,
    ID,
    Int,
    Mutation,
    Resolver,
    Root,
    UnauthorizedError,
} from "type-graphql";
import { Course } from "./Course";

const opt = { nullable: true };

@Resolver(Course)
export class CourseAnalyticsResolver {
    @Authorized()
    @Mutation((returns) => Course)
    public async addCourseAnalyticsBlock(
        @Ctx() context: RequestContext,
        @Arg("courseId", (type) => ID) courseId: string,
        @Arg("type", (type) => AnalyticsType) type: AnalyticsType,
        @Arg("presetId", (type) => ID, opt) presetId?: string
    ) {
        // retrieve the the course
        const course = await context.loadById(DBCourse, courseId);
        if (!course) {
            throw new ApolloError(
                `Course with id ${courseId} not found.`,
                ServerError.NotFound
            );
        }

        // check that the logged in user is allowed to change this course
        if (
            !context.can(Permission.viewAnalytics, course) ||
            course?.archived
        ) {
            throw new UnauthorizedError();
        }

        // retrieve the preset
        const preset = presetId
            ? await DBAnalyticsBlock.findOne({ _id: presetId, published: true })
            : undefined;

        if (presetId && !preset) {
            throw new ApolloError(
                `Preset with id ${presetId} not found.`,
                ServerError.NotFound
            );
        }

        // create the block
        const block = await new DBAnalyticsBlock({
            subjectId: course._id,
            title: preset ? preset.title : "Analytics block",
            fullWidth: preset?.fullWidth,
            type,
            presetId,
        }).save();

        // store the block id in the course
        const blocks = await this.analyticsBlocks(course);
        blocks.push(block);

        // arrange the blocks by type so that moving by index still works
        course.analyticsBlocks = [
            ...blocks.filter((b) => b.type === AnalyticsType.course),
            ...blocks.filter((b) => b.type === AnalyticsType.assignment),
            ...blocks.filter((b) => b.type === AnalyticsType.student),
        ].map((b) => b._id);

        // save the updated course
        await course.save();

        log.notice(
            `Analytics block with id ${block.id} added to course "${course.title}" (${course.id}).`
        );

        // return the course
        return course;
    }

    @Authorized()
    @Mutation((returns) => AnalyticsBlock)
    public async updateCourseAnalyticsBlock(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("input") input: AnalyticsBlockUpdateInput
    ) {
        // retrieve the block
        const block = await context.loadById(DBAnalyticsBlock, id);
        if (!block) {
            throw new ApolloError(
                `Analytics block with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        // retrieve the course
        const course = await context.loadById(DBCourse, block.subjectId);
        if (!course) {
            throw new ApolloError(
                `Course with id ${block.subjectId} not found.`,
                ServerError.NotFound
            );
        }

        // check that the logged in user is allowed to change this block
        if (
            !context.can(Permission.viewAnalytics, course) ||
            course?.archived
        ) {
            throw new UnauthorizedError();
        }

        // set the input
        block.set(input);

        // if the code is changed, remove the link with the preset
        if (input.code) {
            block.presetId = undefined;
        }

        log.notice(
            `Course analytics block with id ${block.id} updated.`,
            input
        );

        // return the block
        return block.save();
    }

    @Authorized()
    @Mutation((returns) => Course)
    public async deleteCourseAnalyticsBlock(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ) {
        // retrieve the block
        const block = await context.loadById(DBAnalyticsBlock, id);

        // if the block doesn't exist, throw an error.
        if (!block) {
            throw new ApolloError(`Analytics block with id ${id} not found.`);
        }

        // retrieve the the course
        const course = await context.loadById(DBCourse, block.subjectId);
        if (!course) {
            throw new ApolloError(
                `Course with id ${block.subjectId} not found.`,
                ServerError.NotFound
            );
        }

        // check that the logged in user is allowed to delete this block
        if (
            !context.can(Permission.viewAnalytics, course) ||
            course?.archived
        ) {
            throw new UnauthorizedError();
        }

        // delete the block
        await DBAnalyticsBlock.findByIdAndDelete(block._id);

        const caches = await DBAnalyticsBlockCache.find({
            analyticsBlockId: block._id,
        });
        for (let cache of caches) {
            await DBAnalyticsBlockCache.findByIdAndDelete(cache._id);
        }

        // remove the block id from the analytics block list
        course.analyticsBlocks = (course.analyticsBlocks || []).filter(
            (b) => !b.equals(block._id)
        );
        await course.save();

        log.notice(
            `Analyics block with id ${block.id} deleted.`,
            block.toJSON()
        );

        // return the course
        return course;
    }

    @Authorized()
    @Mutation((returns) => Course)
    public async moveCourseAnalyticsBlockToIndex(
        @Ctx() context: RequestContext,
        @Arg("index", (type) => Int) index: number,
        @Arg("id", (type) => ID) id: string
    ): Promise<ICourse | null> {
        // retrieve the block
        const block = await context.loadById(DBAnalyticsBlock, id);

        // if the block doesn't exist, throw an error.
        if (!block) {
            throw new ApolloError(`Block with id ${id} not found.`);
        }

        // retrieve the course
        const course = await context.loadById(DBCourse, block.subjectId);
        if (!course) {
            throw new ApolloError(
                `Course with id ${block.subjectId} not found.`,
                ServerError.NotFound
            );
        }

        // check that the logged in user is allowed to change this block
        if (
            !context.can(Permission.viewAnalytics, course) ||
            course?.archived
        ) {
            throw new UnauthorizedError();
        }

        course.analyticsBlocks = course.analyticsBlocks || [];

        // check that the old index is valid
        const oldIndex = course.analyticsBlocks.findIndex((b) =>
            b.equals(block._id)
        );
        if (oldIndex < 0 || oldIndex >= course.analyticsBlocks.length) {
            throw new ApolloError(
                `Invalid existing analytics block index ${oldIndex}.`
            );
        }

        // compute the new index
        const blocksBefore = await this.analyticsBlocks(course);
        const localIndex = blocksBefore
            .filter((b) => b.type === block.type)
            .findIndex((b) => b.equals(block._id));
        const indexOffset = oldIndex - localIndex;
        const newIndex = index + indexOffset;

        // move the block
        arrayMove({
            array: course.analyticsBlocks,
            oldIndex,
            newIndex,
            newArray: course.analyticsBlocks,
        });

        // arrange the blocks by type so that moving by index still works
        const blocks = await this.analyticsBlocks(course);
        course.analyticsBlocks = [
            ...blocks.filter((b) => b.type === AnalyticsType.course),
            ...blocks.filter((b) => b.type === AnalyticsType.assignment),
            ...blocks.filter((b) => b.type === AnalyticsType.student),
        ].map((b) => b._id);

        // store the course
        await course.save();

        log.notice(
            `Analytics block with id ${block.id} moved to index ${index}.`
        );

        return course;
    }

    @FieldResolver((type) => [AnalyticsBlock])
    public async analyticsBlocks(@Root() root: ICourse) {
        const blocks = await DBAnalyticsBlock.find({
            _id: { $in: root.analyticsBlocks || [] },
        });

        const map: Record<string, IAnalyticsBlock> = {};
        for (const block of blocks) {
            if (block.id) {
                map[block.id] = block;
            }
        }
        return (root.analyticsBlocks || []).map(
            (blockId) => map[blockId.toHexString()]
        );
    }
}
