import { RoleType } from "core";
import { DBAnalyticsBlock } from "db/AnalyticsBlock";
import { DBCourse, ICourse } from "db/Course";
import { IFile } from "db/File";
import { DBModule } from "db/Module";
import { DBRole } from "db/Role";
import { DBUser, IUser } from "db/User";
import { copyFile, deleteFiles, listFiles } from "Storage";
import { log } from "../Logger";
import { copyModule, deleteModules } from "./Module.operation";

import mongoose = require("mongoose");

export async function deleteCourse(course: ICourse) {
    // delete the modules belonging to the course
    const modules = await DBModule.find({
        courseId: { $eq: course._id },
    });
    await deleteModules(modules);

    // delete any course files from storage
    await deleteFiles(`course/${course.id}`);

    // delete the course
    await DBCourse.findByIdAndDelete(course._id);

    // delete any existing roles related to the course
    await DBRole.deleteMany({
        subjectId: { $eq: course._id },
    });

    // delete any analytics blocks related to the course
    await DBAnalyticsBlock.deleteMany({
        subjectId: { $eq: course._id },
    });
}

export interface CopyCourseOptions {
    organizationId?: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
}

export async function copyCourse(
    course: ICourse,
    options: CopyCourseOptions = {}
): Promise<ICourse> {
    const { userId, organizationId } = options;

    // retrieve the modules
    const modules = await DBModule.find({
        courseId: course._id,
    });

    // retrieve the analytics blocks
    const analyticsBlocks = await DBAnalyticsBlock.find({
        _id: { $in: course.analyticsBlocks },
    });

    // create a copy of the course
    const newId = new mongoose.Types.ObjectId();
    // first copy the image
    course.image = await copyCourseImage(course, newId);

    // set the id
    course._id = newId;
    course.isNew = true;
    course.demo = false;
    course.library = false;
    course.archived = false; // make sure the course copy is not archived
    course.publicCode = undefined; // by default a course is not published
    course.startDate = undefined; // make sure the course copy is not closed
    course.endDate = undefined; // make sure the course copy is not closed
    course.organizationId = organizationId;
    course.userId = userId;

    // create a copy of the analytics blocks for the course, module, assignment and student analytics pages
    const copyAnalyticsBlock = async (blockId) => {
        const block = analyticsBlocks.find((b) => b._id.equals(blockId));
        if (!block) {
            return;
        }
        block._id = new mongoose.Types.ObjectId();
        block.isNew = true;
        block.subjectId = course._id;
        await block.save();
        return block._id;
    };

    course.analyticsBlocks = await Promise.all(
        (course.analyticsBlocks || []).map(copyAnalyticsBlock)
    );

    // save the course
    await course.save();

    // create a copy of the modules
    await Promise.all(
        modules.map((module) => copyModule(module, course._id, true))
    );

    // return the copy
    return course;
}

export async function copyCourseImage(
    source: ICourse,
    targetId: mongoose.Types.ObjectId
) {
    if (!source.image) {
        return undefined;
    }

    // retrieve the files in storage for this assignment
    const courseFiles = await listFiles(`course/${source.id}`);

    // copy the image associated with the course
    const copy = source.image.toJSON() as IFile;
    copy._id = new mongoose.Types.ObjectId();
    copy.path = `course/${targetId}`;

    // get the assignment files and thumbnails
    const uploads = courseFiles.filter((f) => f.includes(source.image?.id));

    // now copy the files
    await Promise.all(
        uploads.map(async (u) => {
            const target = u
                .replace(source.id, targetId.toHexString())
                .replace(source.image?.id, copy._id.toHexString());
            log.debug(`Copying file [${u}] to [${target}].`);
            return copyFile(u, target);
        })
    );
    return copy;
}

export async function getCourseStudents(course: ICourse): Promise<IUser[]> {
    const studentRoles = await DBRole.find({
        subjectId: course._id,
        role: RoleType.courseStudent,
        active: true,
    });

    // retrieve the corresponding users
    const userIds = studentRoles.map((role) => role.userId);

    return DBUser.find({
        _id: { $in: userIds },
    })
        .sort("lastName firstName emailAddress")
        .collation({ locale: "en", alternate: "shifted" });
}
