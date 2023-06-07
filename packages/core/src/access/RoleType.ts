export enum RoleType {
    organizationAdmin = "organizationAdmin",
    organizationStaff = "organizationStaff",
    organizationStudent = "organizationStudent",
    organizationOther = "organizationOther",
    courseAdmin = "courseAdmin",
    courseEditor = "courseEditor",
    courseChecker = "courseChecker",
    courseViewer = "courseViewer",
    courseStudent = "courseStudent",
}

export const courseRoles = [
    RoleType.courseAdmin,
    RoleType.courseEditor,
    RoleType.courseChecker,
    RoleType.courseViewer,
    RoleType.courseStudent,
];

export const organizationRoles = [
    RoleType.organizationAdmin,
    RoleType.organizationStaff,
    RoleType.organizationStudent,
    RoleType.organizationOther,
];
