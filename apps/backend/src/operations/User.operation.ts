import { DBNotification } from "db/Notification";
import { IOrganization } from "db/Organization";
import { DBRole } from "db/Role";
import { DBSubmission } from "db/Submission";
import { DBUser, IUser } from "db/User";

import mongoose = require("mongoose");

export async function deleteUsersFromOrganization(
    userIds: (string | mongoose.Types.ObjectId)[],
    organization: IOrganization
) {
    // delete any submissions associated with the users and the organization
    await DBSubmission.deleteMany({
        userId: { $in: userIds },
        organizationId: organization._id,
    });

    // delete any roles associated with the users and the organization
    await DBRole.deleteMany({
        userId: { $in: userIds },
        organizationId: organization._id,
    });

    // delete any notifications associated with the users and the organization
    await DBNotification.deleteMany({
        $or: [
            {
                actorId: { $in: userIds },
            },
            {
                subjectId: { $in: userIds },
            },
            {
                receiverId: { $in: userIds },
            },
        ],
        organizationId: organization._id,
    });

    // retrieve the users
    const users = await DBUser.find({ _id: { $in: userIds } });

    // remove the users from the organization or completely
    await Promise.all(
        users.map(async (user) => {
            // remove the organization from the user
            user.organizations = user.organizations.filter(
                (o) => !o.equals(organization._id)
            );
            // if the user is no longer part of an organization, delete it
            if (user.organizations.length === 0) {
                await user.delete();
            } else {
                await user.save();
            }
        })
    );
}

export function isInOrganization(
    user: IUser,
    organizationId?: mongoose.Types.ObjectId
) {
    if (!organizationId) {
        return false;
    }
    for (const id of user.organizations || []) {
        if (id.equals(organizationId)) {
            return true;
        }
    }
    return false;
}
