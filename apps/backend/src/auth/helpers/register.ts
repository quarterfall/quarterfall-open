import { environment } from "config";
import { fallbackLanguage, RoleType } from "core";
import { DBCourse } from "db/Course";
import { DBRole } from "db/Role";
import { DBUser } from "db/User";
import { log } from "Logger";
import { createContact } from "Mail";

import { DBInvitation } from "db/Invitation";
import { copyCourse } from "operations/Course.operation";
import express = require("express");
import requestIp = require("request-ip");

export interface RegisterInput {
    firstName: string;
    lastName: string;
    emailAddress: string;
    language?: string;
    enrollmentCode?: string;
}

export const registerUser = async (
    req: express.Request,
    res: express.Response
) => {
    const { input }: { input: RegisterInput } = req.body;
    const { firstName, lastName, language } = input;
    const emailAddress = input.emailAddress?.toLowerCase();
    const enrollmentCode = input.enrollmentCode?.toLowerCase();

    // find the user
    let user = await DBUser.findOne({
        emailAddress,
    });

    // Check if user has invites
    let invitations = await DBInvitation.find({
        userId: user?._id,
    });

    let course = await DBCourse.findOne({
        enrollmentCode,
    });

    if (!invitations.length && !course) {
        res.status(500).json({
            message:
                "Cannot register user: User hasn't been invited to any course or organization.",
        });
        return;
    }

    if (user?.firstName && user?.lastName) {
        res.status(500).json({
            message: "Cannot register user: User already exists.",
        });
        return;
    }

    // create the user if he doesn't exist yet
    if (!user) {
        user = await DBUser.create({
            emailAddress,
            organizations: [],
            salts: [],
        });
    }

    // update the user information
    user.set({
        firstName,
        lastName,
        language: language || fallbackLanguage,
        ...(course && {
            organizations: [course?.organizationId],
        }),
        // add the tos acceptance date and ip
        tosAcceptanceDate: new Date(),
        tosAcceptanceIp: requestIp.getClientIp(req),
    });

    await user.save();

    // Check if user has student role
    let role = await DBRole.findOne({
        userId: user._id,
    });

    if (course && !role) {
        // create organization role
        role = await DBRole.create({
            organizationId: course.organizationId,
            role: RoleType.organizationStudent,
            subjectId: course.organizationId,
            userId: user?._id,
            active: true,
        });

        // create course role
        // create the course role
        await DBRole.create({
            organizationId: course.organizationId,
            role: RoleType.courseStudent,
            subjectId: course?._id,
            userId: user?._id,
            active: true,
        });
    }

    const student = role?.role === RoleType.organizationStudent;
    // add the user to SendGrid if not a student
    if (environment === "production" && !student) {
        createContact(user);
    }

    if (!student) {
        // create demo courses for the user
        const importCourses = await DBCourse.find({ demo: true });

        // copy each of the courses to be imported
        await Promise.all(
            importCourses.map(async (course) => {
                // copy the course
                const courseCopy = await copyCourse(course, {
                    userId: user?._id,
                });

                // create an admin role for the user that created the course
                await new DBRole({
                    subjectId: courseCopy._id,
                    role: RoleType.courseAdmin,
                    userId: user?._id,
                    active: true,
                }).save();
            })
        );
    }

    log.info(
        `Successfully registered user ${user.firstName} ${user.lastName} with email ${user.emailAddress} (${user.id})`
    );
};
