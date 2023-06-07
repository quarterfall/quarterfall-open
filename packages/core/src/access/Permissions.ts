export enum Permission {
    readOrganization = "readOrganization", // (whether someone can view general organization information)
    readOrganizationLicense = "readOrganizationLicense", // (whether someone can view organization license information)
    updateOrganization = "updateOrganization", // (whether someone can edit general organization information)
    updateOrganizationLicense = "updateOrganizationLicense", // (whether someone can edit organization license information)
    createOrganizationUser = "createOrganizationUser", // (whether someone can create a new user within the organization, including staff and admins)
    createOrganizationStudent = "createOrganizationStudent", // (whether someone can create new student users within the organization)
    readOrganizationUser = "readOrganizationUser", // (whether someone can view any user within the organization)
    updateOrganizationUser = "updateOrganizationUser", // (whether someone can edit any user within the organization)
    deleteOrganizationUser = "deleteOrganizationUser", // (whether someone can delete any user from the organization)
    createCourse = "createCourse", // (whether someone can create a new course within the organization)
    readAnyCourse = "readAnyCourse", // (whether someone can view any course within the organization, excluding hidden courses)
    readAnyCourseHidden = "readAnyCourseHidden", // (whether someone can view hidden courses within the organization)
    updateAnyCourse = "updateAnyCourse", // (whether someone can edit any course within the organization)
    deleteAnyCourse = "deleteAnyCourse", // (whether someone can delete any course within the organization)
    readAnyCourseUser = "readAnyCourseUser", // (whether someone can view the user list of any course within the organization)
    updateAnyCourseUser = "updateAnyCourseUser", // (whether someone can edit the user list of any course within the organization)

    readCourse = "readCourse", // (whether someone can view a particular course)
    updateCourse = "updateCourse", // (whether someone can edit the modules and assignments, and other aspects of a particular course)
    deleteCourse = "deleteCourse", // (whether someone can delete a particular course)
    readCourseUser = "readCourseUser", // (whether someone can view the list of users in a course)
    updateCourseUser = "updateCourseUser", // (whether someone can enroll or disenroll users)
    doAssignment = "doAssignment", // (whether someone can do an assignment)
    testAssignment = "testAssignment", // (whether someone can test an assignment)
    readSubmission = "readSubmission", // (whether someone can see student submissions)
    updateSubmission = "updateSubmission", // (whether someone can edit student submissions)
    deleteSubmission = "deleteSubmission", // (whether someone can delete student submissions)
    viewAnalytics = "viewAnalytics", // (whether someone can view analytics)
}

export function getParentPermission(permission: Permission): Permission | null {
    switch (permission) {
        case Permission.readCourse:
            return Permission.readAnyCourse;
        case Permission.updateCourse:
            return Permission.updateAnyCourse;
        case Permission.deleteCourse:
            return Permission.deleteAnyCourse;
        case Permission.readCourseUser:
            return Permission.readAnyCourseUser;
        case Permission.updateCourseUser:
            return Permission.updateAnyCourseUser;
        default:
            return null;
    }
}
