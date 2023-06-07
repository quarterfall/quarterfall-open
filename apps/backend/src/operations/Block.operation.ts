import { generateId } from "core";
import { DBAction } from "db/Action";
import { DBBlock, IBlock } from "db/Block";
import { Types } from "mongoose";
import { copyBlockActions } from "./Action.operation";

export async function copyAssignmentBlocks(
    assignmentId: string | Types.ObjectId,
    newAssignmentId: Types.ObjectId
) {
    const blocks = await DBBlock.find({
        assignmentId,
    });
    return Promise.all(
        blocks.map(async (e, i) => copyBlock(e, newAssignmentId, true))
    );
}

export async function copyBlock(
    block: IBlock,
    assignmentId?: Types.ObjectId,
    keepIndex?: boolean
): Promise<IBlock | null> {
    // create a new block
    const newBlockId = new Types.ObjectId();

    // optionally point to the new assignment
    if (assignmentId && !assignmentId.equals(block.assignmentId)) {
        block.assignmentId = assignmentId;
        if (!keepIndex) {
            // set the index very high so the block appears at the end
            block.index = Number.MAX_SAFE_INTEGER;
        }
    }

    // generate new ids for the choices and actions
    const choices = block.choices || [];
    for (const choice of choices) {
        choice.id = generateId();
    }

    block.actions = (await copyBlockActions(block._id, newBlockId)) || [];

    block._id = newBlockId;
    block.isNew = true;

    // save the block copy
    await block.save();

    if (keepIndex) {
        return block;
    }

    // regenerate the indices for all the blocks in this assignment
    await generateBlockIndices(block.assignmentId);

    // return the copy
    return DBBlock.findById(block._id);
}

export async function deleteBlock(block: IBlock) {
    // delete the block
    await DBBlock.findByIdAndDelete(block._id);

    // delete actions associated with block
    await DBAction.deleteMany({ _id: { $in: block.actions } });

    // regenerate the indices for all remaining blocks
    return generateBlockIndices(block.assignmentId);
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
