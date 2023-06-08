import { ApolloError } from "apollo-server-express";
import { AnalyticsType, arrayMove, Permission, ServerError } from "core";
import { DBAnalyticsBlock, IAnalyticsBlock } from "db/AnalyticsBlock";
import { IOrganization } from "db/Organization";
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
import { Organization } from "./Organization";
import mongoose = require("mongoose");

const opt = { nullable: true };

@Resolver(Organization)
export class OrganizationAnalyticsResolver {
    @Authorized()
    @Mutation((returns) => Organization)
    public async addOrganizationAnalyticsBlock(
        @Ctx() context: RequestContext,
        @Arg("presetId", (type) => ID, opt) presetId?: string
    ) {
        const { organization } = context;

        // check that the logged in user is allowed to change the organization
        if (!organization || !context.can(Permission.updateOrganization)) {
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
            subjectId: organization._id,
            title: preset ? preset.title : "Analytics block",
            fullWidth: preset?.fullWidth,
            type: AnalyticsType.organization,
            presetId,
        }).save();

        // store the block id in the organization
        const blocks = await this.analyticsBlocks(organization);
        blocks.push(block);
        organization.analyticsBlocks = blocks.map((b) => b._id);

        // save the updated organization
        await organization.save();

        log.notice(
            `Analytics block with id ${block.id} added to organization "${organization.name}" (${organization.id}).`
        );

        // return the organization
        return organization;
    }

    @Authorized()
    @Mutation((returns) => AnalyticsBlock)
    public async updateOrganizationAnalyticsBlock(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string,
        @Arg("input") input: AnalyticsBlockUpdateInput
    ) {
        const { organization } = context;

        // check that the logged in user is allowed to change the organization
        if (!organization || !context.can(Permission.updateOrganization)) {
            throw new UnauthorizedError();
        }

        // retrieve the block
        const block = await context.loadById(DBAnalyticsBlock, id);
        if (!block) {
            throw new ApolloError(
                `Analytics block with id ${id} not found.`,
                ServerError.NotFound
            );
        }

        // verify that the block is part of the organization
        if (!block.subjectId.equals(organization._id)) {
            throw new UnauthorizedError();
        }

        // set the input
        block.set(input);

        // if the code is changed, remove the link with the preset
        if (input.code) {
            block.presetId = undefined;
        }

        log.notice(
            `Organization analytics block with id ${block.id} updated.`,
            input
        );

        // return the block
        return block.save();
    }

    @Authorized()
    @Mutation((returns) => Organization)
    public async deleteOrganizationAnalyticsBlock(
        @Ctx() context: RequestContext,
        @Arg("id", (type) => ID) id: string
    ) {
        const { organization } = context;

        // check that the logged in user is allowed to change the organization
        if (!organization || !context.can(Permission.updateOrganization)) {
            throw new UnauthorizedError();
        }

        // retrieve the block
        const block = await context.loadById(DBAnalyticsBlock, id);

        // if the block doesn't exist, throw an error.
        if (!block) {
            throw new ApolloError(`Analytics block with id ${id} not found.`);
        }

        // verify that the block is part of the organization
        if (!block.subjectId.equals(organization._id)) {
            throw new UnauthorizedError();
        }

        // delete the block
        await DBAnalyticsBlock.findByIdAndDelete(block._id);

        // remove the block id from the organization analytics block list
        organization.analyticsBlocks = (
            organization.analyticsBlocks || []
        ).filter((b) => !b.equals(block._id));
        await organization.save();

        log.notice(
            `Analyics block with id ${block.id} deleted.`,
            block.toJSON()
        );

        // return the organization
        return organization;
    }

    @Authorized()
    @Mutation((returns) => Organization)
    public async moveOrganizationAnalyticsBlockToIndex(
        @Ctx() context: RequestContext,
        @Arg("index", (type) => Int) index: number,
        @Arg("id", (type) => ID) id: string
    ): Promise<IOrganization> {
        const { organization } = context;

        // check that the logged in user is allowed to change the organization
        if (!organization || !context.can(Permission.updateOrganization)) {
            throw new UnauthorizedError();
        }

        // retrieve the block
        const block = await context.loadById(DBAnalyticsBlock, id);

        // if the block doesn't exist, throw an error.
        if (!block) {
            throw new ApolloError(`Block with id ${id} not found.`);
        }

        // verify that the block is part of the organization
        if (!block.subjectId.equals(organization._id)) {
            throw new UnauthorizedError();
        }

        organization.analyticsBlocks = organization.analyticsBlocks || [];

        // check that the old index is valid
        const oldIndex = organization.analyticsBlocks.findIndex((b) =>
            b.equals(block._id)
        );
        if (oldIndex < 0 || oldIndex >= organization.analyticsBlocks.length) {
            throw new ApolloError(
                `Invalid existing analytics block index ${oldIndex}.`
            );
        }

        // move the block
        arrayMove({
            array: organization.analyticsBlocks,
            oldIndex,
            newIndex: index,
            newArray: organization.analyticsBlocks,
        });

        // store the new block array
        const blocks = await this.analyticsBlocks(organization);
        organization.analyticsBlocks = blocks.map((b) => b._id);

        // store the organization
        await organization.save();

        log.notice(
            `Analytics block with id ${block.id} moved to index ${index}.`
        );

        return organization;
    }

    @FieldResolver((type) => [AnalyticsBlock])
    public async analyticsBlocks(@Root() root: IOrganization) {
        const blocks = await DBAnalyticsBlock.find({
            _id: { $in: root.analyticsBlocks || [] },
        });

        const map: Record<string, IAnalyticsBlock> = {};
        for (const block of blocks) {
            map[block.id] = block;
        }
        return (root.analyticsBlocks || []).map(
            (blockId) => map[blockId.toHexString()]
        );
    }
}
