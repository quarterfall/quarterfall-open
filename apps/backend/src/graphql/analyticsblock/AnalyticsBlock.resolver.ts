import { ApolloError } from "apollo-server-express";
import { colors } from "config";
import { AnalyticsType, Permission, ServerError } from "core";
import { DBAnalyticsBlock, IAnalyticsBlock } from "db/AnalyticsBlock";
import { DBAnalyticsBlockCache } from "db/AnalyticsBlockCache";
import { DBCourse } from "db/Course";
import { log } from "Logger";
import { computeAnalyticsBlock } from "operations/Analytics.operation";
import { RequestContext } from "RequestContext";
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

import { AnalyticsBlock } from "./AnalyticsBlock";
import { AnalyticsBlockCache } from "./AnalyticsBlockCache";
import { AnalyticsBlockComputeResult } from "./AnalyticsBlockCompute.result";
import { AnalyticsBlockPresetUpdateInput } from "./AnalyticsBlockPresetUpdate.input";

const opt = { nullable: true };

@Resolver(AnalyticsBlock)
export class AnalyticsBlockResolver {
    @Authorized()
    @Query((returns) => [AnalyticsBlock], opt)
    public async publishedAnalyticsBlockPresets(
        @Ctx() context: RequestContext
    ) {
        return DBAnalyticsBlock.find({ isGlobalPreset: true, published: true });
    }

    @Authorized()
    @Query((returns) => [AnalyticsBlock], opt)
    public async analyticsBlockPresets(@Ctx() context: RequestContext) {
        if (!context.isSysAdmin) {
            throw new ApolloError(
                `Only system administrators may view all analytics presets.`,
                ServerError.NotAuthorized
            );
        }
        return DBAnalyticsBlock.find({ isGlobalPreset: true });
    }

    @Authorized()
    @Query((returns) => AnalyticsBlock, opt)
    public async analyticsBlockPreset(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ) {
        const block = await DBAnalyticsBlock.findById(id);
        return block?.isGlobalPreset ? block : null;
    }

    @Authorized()
    @Mutation((returns) => AnalyticsBlock)
    public async addAnalyticsBlockPreset(
        @Ctx() context: RequestContext,
        @Arg("presetName", (type) => String) presetName: string,
        @Arg("type", (type) => AnalyticsType) type: AnalyticsType
    ) {
        if (!context.isSysAdmin) {
            throw new ApolloError(
                `Only system administrators may add analytics presets.`,
                ServerError.NotAuthorized
            );
        }

        // create the block
        const block = await new DBAnalyticsBlock({
            presetName,
            title: "Analytics Block",
            isGlobalPreset: true,
            published: false,
            type,
        }).save();

        log.notice(`Analytics block preset created with id ${block.id}.`);

        // return the block
        return block;
    }

    @Authorized()
    @Mutation((returns) => AnalyticsBlock)
    public async updateAnalyticsBlockPreset(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("input") input: AnalyticsBlockPresetUpdateInput
    ) {
        if (!context.isSysAdmin) {
            throw new ApolloError(
                `Only system administrators may update analytics presets.`,
                ServerError.NotAuthorized
            );
        }

        // retrieve the block
        const block = await context.loadById(DBAnalyticsBlock, id);
        if (!block?.isGlobalPreset) {
            throw new ApolloError(
                `Analytics preset block with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        // set the input
        block.set(input);

        log.notice(
            `Analytics block preset with id ${block.id} updated.`,
            input
        );

        // return the block
        return block.save();
    }

    @Authorized()
    @Mutation((returns) => [AnalyticsBlock])
    public async deleteAnalyticsBlockPresets(
        @Ctx() context: RequestContext,
        @Arg("ids", (type) => [ID]) ids: string[]
    ) {
        if (!context.isSysAdmin) {
            throw new ApolloError(
                `Only system administrators may delete analytics presets.`,
                ServerError.NotAuthorized
            );
        }

        // find the blocks
        const blocks = await DBAnalyticsBlock.find({ _id: { $in: ids } });

        // verify that each block is actually a preset
        for (const block of blocks) {
            if (!block?.isGlobalPreset) {
                throw new ApolloError(
                    `Analytics preset block with id ${block.id} not found.`,
                    ServerError.NotFound
                );
            }
        }

        await DBAnalyticsBlock.deleteMany({ _id: { $in: ids } });

        log.notice(`Analytics block presets deleted: ${ids}.`);

        // return the deleted blocks
        return blocks;
    }

    @Authorized()
    @Mutation((returns) => AnalyticsBlockComputeResult)
    public async computeAnalyticsBlock(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("targetId", (type) => ID, opt) targetId?: string,
        @Arg("courseId", (type) => ID, opt) courseId?: string
    ) {
        const { organization } = context;

        if (!organization) {
            throw new UnauthorizedError();
        }
        // retrieve the analytics block
        const analyticsBlock = await DBAnalyticsBlock.findById(id);
        if (!analyticsBlock) {
            throw new ApolloError(
                `Analytics block with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        // if it's based on a preset, retrieve the preset and replace the code
        if (analyticsBlock.presetId) {
            const preset = await DBAnalyticsBlock.findById(
                analyticsBlock.presetId
            );
            if (preset) {
                analyticsBlock.code = preset.code;
            }
        }

        // Case 1: the block is a global preset
        if (analyticsBlock.isGlobalPreset) {
            // only system admins may compute analytics on presets directly
            if (!context.isSysAdmin) {
                throw new UnauthorizedError();
            }
        }
        // Case 2: the block is an organization analytics block default
        else if (
            organization?.courseAnalyticsBlockDefaults?.find((id) =>
                id.equals(analyticsBlock._id)
            )
        ) {
            // check that the logged in user is allowed to update the organization
            if (!context.can(Permission.updateOrganization)) {
                throw new UnauthorizedError();
            }
        }
        // Case 3: the block is a course analytics block
        else {
            // retrieve the course
            const course = await context.loadById(
                DBCourse,
                analyticsBlock.subjectId
            );
            if (!course) {
                throw new ApolloError(
                    `Course with id ${analyticsBlock.subjectId} not found.`,
                    ServerError.NotFound
                );
            }

            // check that the logged in user is allowed to view course analytics
            if (!context.can(Permission.viewAnalytics, course)) {
                throw new UnauthorizedError();
            }
        }

        // compute the colors object
        const c = {
            ...colors,
        };
        c.primary = organization.primaryColor || c.primary;
        c.secondary = organization.secondaryColor || c.secondary;

        const result = await computeAnalyticsBlock({
            blockId: analyticsBlock._id,
            targetId,
            courseId,
        });

        // compute the result
        return result;
    }

    @FieldResolver((type) => String)
    public async code(
        @Ctx() context: RequestContext,
        @Root() root: IAnalyticsBlock
    ) {
        // retrieve the preset
        const preset = root.presetId
            ? await DBAnalyticsBlock.findById(root.presetId)
            : null;

        // return either the preset code or the code in the block itself
        return preset?.code || root.code || "";
    }

    @FieldResolver((type) => [AnalyticsBlockCache])
    public async cache(
        @Ctx() context: RequestContext,
        @Root() root: IAnalyticsBlock
    ) {
        const course = await DBCourse.findById(root?.subjectId);

        if (!course) {
            throw new UnauthorizedError();
        }

        return DBAnalyticsBlockCache.find({
            analyticsBlockId: root._id,
        });
    }
}
