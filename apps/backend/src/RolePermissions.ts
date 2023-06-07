import { Permission, RoleType } from "core";

export function getPermissionsForRole(role?: RoleType) {
    switch (role) {
        case RoleType.organizationAdmin:
            return [
                Permission.readOrganization,
                Permission.readOrganizationLicense,
                Permission.updateOrganization,
                Permission.updateOrganizationLicense,
                Permission.createOrganizationUser,
                Permission.createOrganizationStudent,
                Permission.readOrganizationUser,
                Permission.updateOrganizationUser,
                Permission.deleteOrganizationUser,
                Permission.createCourse,
                Permission.readAnyCourse,
                Permission.readAnyCourseHidden,
                Permission.deleteAnyCourse,
                Permission.readAnyCourseUser,
                Permission.updateAnyCourseUser,
            ];
        case RoleType.organizationStaff:
            return [
                Permission.readOrganization,
                Permission.readOrganizationUser,
                Permission.createOrganizationStudent,
                Permission.createCourse,
                Permission.readAnyCourse,
            ];
        case RoleType.organizationStudent:
            return [Permission.readOrganization];
        case RoleType.organizationOther:
            return [Permission.readOrganization];
        case RoleType.courseAdmin:
            return [
                Permission.readCourse,
                Permission.updateCourse,
                Permission.deleteCourse,
                Permission.readCourseUser,
                Permission.updateCourseUser,
                Permission.readSubmission,
                Permission.updateSubmission,
                Permission.deleteSubmission,
                Permission.viewAnalytics,
                Permission.testAssignment,
            ];
        case RoleType.courseEditor:
            return [
                Permission.readCourse,
                Permission.updateCourse,
                Permission.testAssignment,
            ];
        case RoleType.courseChecker:
            return [
                Permission.readCourse,
                Permission.readCourseUser,
                Permission.readSubmission,
                Permission.updateSubmission,
                Permission.testAssignment,
                Permission.viewAnalytics,
            ];
        case RoleType.courseViewer:
            return [Permission.readCourse];
        case RoleType.courseStudent:
            return [Permission.readCourse, Permission.doAssignment];
        default:
            return [];
    }
}
