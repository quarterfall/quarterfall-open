import { RoleType } from "core";
import { isAfter } from "date-fns";
import { DBAnalyticsBlock } from "db/AnalyticsBlock";
import { DBCourse } from "db/Course";
import { DBGradingScheme } from "db/GradingScheme";
import { IOrganization } from "db/Organization";
import { DBRole } from "db/Role";
import { DBUser } from "db/User";
import { log } from "../Logger";
import { deleteCourse } from "./Course.operation";
import { deleteUsersFromOrganization } from "./User.operation";

/**
 * Checks whether the license for this organization has expired.
 */
export function organizationLicenseExpired(
    organization: IOrganization
): boolean {
    return (
        organization.licenseRenewalDate &&
        isAfter(new Date(), organization.licenseRenewalDate)
    );
}

/**
 * Compute the number of teacher/admins that this organization currently uses.
 */
export async function organizationTeacherQuotaUsed(
    organization: IOrganization
): Promise<number> {
    // 'any' is needed due to a bug in Mongoose's typing
    const teacherOrAdminRoles: any[] = [
        RoleType.organizationStaff,
        RoleType.organizationAdmin,
    ];
    // count how many teachers/admins there currently are
    return DBRole.countDocuments({
        organizationId: organization._id,
        role: { $in: teacherOrAdminRoles },
        active: true,
    });
}

/**
 * Determines whether a user with the given role has access to the platform according to the current license.
 */
export function hasPlatformAccess(
    organization: IOrganization,
    role?: RoleType
): boolean {
    // if there is no role, you don't have access
    if (!role) {
        return false;
    }

    // organization administrators always have access
    if (role === RoleType.organizationAdmin) {
        return true;
    }

    // if the license is expired, block access
    if (
        organizationLicenseExpired(organization) &&
        organization.licenseEnforceRenewalDate
    ) {
        return false;
    }

    // in all other cases, grant access
    return true;
}

/**
 * Delete an organization including any associated documents
 */
export async function deleteOrganization(organization: IOrganization) {
    // find the courses associated with this organization
    const courses = await DBCourse.find({ organizationId: organization._id });

    // delete them
    await Promise.all(courses.map((course) => deleteCourse(course)));

    // find the users associated with this organization
    const users = await DBUser.find({ organizations: organization._id });

    // delete them
    await deleteUsersFromOrganization(
        users.map((user) => user._id),
        organization
    );

    log.notice(`Removed ${users.length} users.`);

    // delete organization analytics blocks
    await DBAnalyticsBlock.deleteMany({ subjectId: organization._id });

    log.notice(`Deleted organization analytics blocks.`);

    //delete grading schemes
    await DBGradingScheme.deleteMany({ organizationId: organization._id });

    // delete the organization
    await organization.delete();

    log.notice(`Organization with id ${organization._id} deleted.`);
}
