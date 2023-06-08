import { ApolloError } from "apollo-server-express";
import { ServerError } from "core";
import { DBAction, IAction } from "db/Action";
import { DBBlock } from "db/Block";
import { Types } from "mongoose";
import { UnauthorizedError } from "type-graphql";

export async function copyBlockActions(
    blockId: string | Types.ObjectId,
    newBlockId: Types.ObjectId
) {
    const block = await DBBlock.findById(blockId);
    if (!block) {
        throw new UnauthorizedError();
    }

    const ids = block.actions || [];
    //Sort actions according to the block.actions
    const actions = await DBAction.find({
        blockId,
    });

    return Promise.all(
        actions
            .sort((a, b) => ids.indexOf(a._id) - ids.indexOf(b._id))
            .map(async (e, i) => (await copyAction(e.id, newBlockId, true)).id)
    );
}

export async function copyAction(
    actionId: Types.ObjectId,
    blockId?: Types.ObjectId,
    keepIndex?: boolean
) {
    const block = await DBBlock.findById(blockId);
    const action = await DBAction.findById(actionId);

    if (!action) {
        throw new ApolloError(
            `Action with ${actionId} not found.`,
            ServerError.NotFound
        );
    }

    // Store the current index for duplicating action if needed
    const currentIndex = (block?.actions || []).findIndex((value) =>
        value._id.equals(action._id)
    );

    // create a new action
    action._id = new Types.ObjectId();
    action.isNew = true;

    // optionally point to the new block
    if (blockId && !blockId.equals(action.blockId)) {
        action.blockId = blockId;
    }

    // save the action copy
    await action.save();

    if (keepIndex) {
        return action;
    }

    if (!block) {
        throw new ApolloError(
            `Block with ${blockId} not found.`,
            ServerError.NotFound
        );
    }

    if (currentIndex < 0 || currentIndex >= block.actions.length) {
        throw new ApolloError(`Invalid existing index ${currentIndex}.`);
    }

    //insert the action in the block
    block.actions?.splice(currentIndex + 1, 0, action._id);

    block.save();

    // return the copy
    return action;
}

export async function deleteAction(action: IAction) {
    // delete the block
    await DBAction.findByIdAndDelete(action._id);

    const block = await DBBlock.findById(action.blockId);

    if (!block) {
        throw new ApolloError(
            `Block with id ${action.blockId} not found.`,
            ServerError.NotFound
        );
    }

    block.actions = (block?.actions || []).filter(
        (actionId) => !actionId.equals(action._id)
    );
    block.markModified("actions");
    return block.save();
}

export async function generateActionIndices(blockId: string | Types.ObjectId) {
    const block = await DBBlock.findById(blockId);
    const actions = await DBAction.find({
        blockId,
    });
}

// generate the indices for all the blocks in this assignment
export async function generateBlockIndices(
    assignmentId: string | Types.ObjectId
) {
    const blocks = await DBBlock.find({
        assignmentId,
    }).sort("index");
    await Promise.all(
        blocks.map(async (e, i) => {
            e.index = i;
            await e.save();
        })
    );
}
