import { DBAssignment } from "db/Assignment";
import { DBBlock } from "db/Block";
import { DBModule, IModule } from "db/Module";
import {
    assignmentIsCompleted,
    copyAssignment,
    deleteAssignments,
} from "./Assignment.operation";

import mongoose = require("mongoose");

export async function moduleCompleted(
    moduleId: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId
): Promise<boolean> {
    // retrieve the visible assignments belonging to this module
    const allAssignments = await DBAssignment.find({ moduleId, visible: true });

    // filter out optional assignments and assignments that have no associated blocks
    const blockCounts = await Promise.all(
        allAssignments.map((a) =>
            DBBlock.countDocuments({ assignmentId: a.id })
        )
    );
    const assignments = allAssignments.filter(
        (a, index) => !a.isOptional && blockCounts[index] > 0
    );

    // check that each mandatory assignment is completed
    const completed = await Promise.all(
        assignments.map((a) => assignmentIsCompleted(a, userId))
    );
    return completed.every((v) => v);
}

export async function moduleIsOptional(
    moduleId: string | mongoose.Types.ObjectId
): Promise<boolean> {
    // retrieve the visible assignments belonging to this module
    const assignments = await DBAssignment.find({ moduleId, visible: true });

    // check that each assignment is optional
    const optional = await Promise.all(assignments.map((a) => a.isOptional));
    return optional.every((v) => v);
}

export async function deleteModule(module: IModule) {
    // delete any assignments associated with this module
    const assignments = await DBAssignment.find({ moduleId: module._id });
    await deleteAssignments(assignments);

    // delete the module
    await DBModule.findByIdAndDelete(module._id);

    // regenerate the indices for the remaining modules
    const modules = await DBModule.find({
        courseId: module.courseId,
    }).sort("index");
    return Promise.all(
        modules.map(async (a, i) => {
            a.index = i;
            await a.save();
        })
    );
}

export async function deleteModules(modules: IModule[]) {
    for (const module of modules) {
        // we're not using Promise.all here since it might lead to
        // instability because module indices are also updated after
        // a delete operation
        await deleteModule(module);
    }
}

export async function copyModule(
    module: IModule,
    courseId?: mongoose.Types.ObjectId,
    keepIndex?: boolean
): Promise<IModule> {
    // retrieve the assignments belonging to this module
    const assignments = await DBAssignment.find({
        moduleId: module._id,
    });

    // make a copy of the module that optionally points to the course with the given id
    module._id = new mongoose.Types.ObjectId();
    if (courseId) {
        if (!keepIndex) {
            // set the index very high so the module appears at the end
            module.index = Number.MAX_SAFE_INTEGER;
        }
        module.courseId = courseId;
    }
    module.isNew = true;
    await module.save();

    // make a copy of the assignments pointing to this module
    await Promise.all(
        assignments.map((assignment) =>
            copyAssignment(assignment, module._id, true)
        )
    );

    // regenerate the indices for the modules in this course if needed
    if (!keepIndex) {
        const modules = await DBModule.find({
            courseId: module.courseId,
        }).sort("index");
        await Promise.all(
            modules.map(async (a, i) => {
                a.index = i;
                await a.save();
            })
        );
    }

    // return the copy
    return module;
}
