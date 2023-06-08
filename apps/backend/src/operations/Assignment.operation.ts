import { BlockType, generateId } from "core";
import { DBAction } from "db/Action";
import { DBAssignment, IAssignment } from "db/Assignment";
import { DBBlock } from "db/Block";
import { IFile } from "db/File";
import { DBGradingScheme } from "db/GradingScheme";
import { DBSubmission } from "db/Submission";
import { Types } from "mongoose";
import { copyAssignmentBlocks } from "operations/Block.operation";
import { log } from "../Logger";
import { copyFile, deleteFiles, listFiles } from "../Storage";

export async function assignmentIsStudyMaterial(
    assignment: IAssignment | null
): Promise<boolean> {
    // count whether there are questions in the blocks
    return (
        (await DBBlock.countDocuments({
            assignmentId: assignment?._id,
            type: {
                $in: [
                    BlockType.CodeQuestion,
                    BlockType.OpenQuestion,
                    BlockType.MultipleChoiceQuestion,
                    BlockType.DatabaseQuestion,
                    BlockType.FileUploadQuestion,
                ],
            },
        })) === 0
    );
}

export async function assignmentIsCompleted(
    assignment: IAssignment,
    userId: string | Types.ObjectId
): Promise<boolean> {
    // we might need to make this more generic to deal with different submissions
    return (
        (await DBSubmission.countDocuments({
            assignmentId: assignment._id,
            userId,
            submittedDate: { $exists: true, $lte: new Date() },
        })) > 0
    );
}

export async function deleteAssignment(assignment: IAssignment) {
    //delete any actions associated with the blocks in the assignment
    const blocks = await DBBlock.find({ assignmentId: assignment._id });
    await Promise.all(
        blocks.map((block) => DBAction.deleteMany({ blockId: block?._id }))
    );

    // delete any blocks associated with the assignment
    await DBBlock.deleteMany({ assignmentId: assignment._id });

    // delete any submissions associated with the assignment
    await DBSubmission.deleteMany({ assignmentId: assignment._id });

    // delete any files associated with the assignment
    await deleteFiles(`assignment/${assignment.id}/files`);

    // delete the assignment
    await DBAssignment.findByIdAndDelete(assignment._id);

    //delete the gradingSchemes
    await DBGradingScheme.deleteMany({ assignmentId: assignment._id });

    // regenerate the indices for all remaining assignments
    const assignments = await DBAssignment.find({
        moduleId: assignment.moduleId,
    }).sort("index");
    return Promise.all(
        assignments.map(async (a, i) => {
            a.index = i;
            await a.save();
        })
    );
}

export async function deleteAssignments(assignments: IAssignment[]) {
    for (const assignment of assignments) {
        // we're not using Promise.all here since it might lead to
        // instability because assignment indices are also updated after
        // a delete operation
        await deleteAssignment(assignment);
    }
}

export async function copyAssignment(
    assignment: IAssignment,
    moduleId?: Types.ObjectId,
    keepIndex?: boolean
): Promise<IAssignment> {
    // create a new assignment id
    const newAssignmentId = new Types.ObjectId();

    // optionally point to the new module
    if (moduleId) {
        assignment.moduleId = moduleId;
        if (!keepIndex) {
            // set the index very high so the assignment appears at the end
            assignment.index = Number.MAX_SAFE_INTEGER;
        }
    }

    // copy the files associated with the assignment
    assignment.files = await copyAssignmentFiles(assignment, newAssignmentId);

    // copy the blocks associated with the assignment
    await copyAssignmentBlocks(assignment._id, newAssignmentId);

    assignment.publicKey = generateId({
        allowed: ["numbers", "lowercaseLetters"],
        length: 8,
    });

    // remove the share code
    if (assignment.shareCode) {
        assignment.shareCode = undefined;
    }

    // assign the new id to the assignment and save it
    assignment._id = newAssignmentId;
    assignment.isNew = true;

    await assignment.save();

    // regenerate the indices for the assignments in this module
    if (assignment.moduleId && !keepIndex) {
        const assignments = await DBAssignment.find({
            moduleId: assignment.moduleId,
        }).sort("index");
        await Promise.all(
            assignments.map(async (a, i) => {
                a.index = i;
                await a.save();
            })
        );
    }

    // return the copy
    return assignment;
}

export async function copyAssignmentFiles(
    sourceAssignment: IAssignment,
    targetAssignmentId: Types.ObjectId
): Promise<IFile[]> {
    // retrieve the files in storage for this assignment
    const assignmentFiles = await listFiles(
        `assignment/${sourceAssignment.id}/files`
    );

    // copy the files associated with the assignment
    const files = sourceAssignment.files || [];
    return Promise.all(
        files.map(async (file) => {
            const copy: IFile = file.toJSON() as IFile;
            copy._id = new Types.ObjectId();
            copy.path = `assignment/${targetAssignmentId}/files`;

            // get the assignment files and thumbnails
            const uploads = assignmentFiles.filter((f) => f.includes(file.id));
            // now copy the files
            uploads.map(async (u) => {
                const target = u
                    .replace(
                        sourceAssignment.id,
                        targetAssignmentId.toHexString()
                    )
                    .replace(file.id, copy._id.toHexString());
                log.debug(`Copying file [${u}] to [${target}].`);
                return copyFile(u, target);
            });
            return copy;
        })
    );
}
