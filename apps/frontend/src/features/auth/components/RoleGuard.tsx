import { useAuthContext } from "context/AuthProvider";
import { RoleType } from "core";
import { ReactNode } from "react";
import { AccessErrorPage } from "routes/error/AccessErrorPage";

export interface RoleGuardProps {
    children: ReactNode;
    showSysAdminInterface?: boolean;
    showStaffInterface?: boolean;
    showStudentInterface?: boolean;
    courseId?: string;
}

export const RoleGuard = (props: RoleGuardProps) => {
    const {
        showSysAdminInterface = false,
        showStaffInterface = false,
        showStudentInterface = false,
        courseId,
        children,
    } = props;

    const { me } = useAuthContext();

    // If there we are at a course page, the organization role must be overwritten
    const courseRole = me?.courses.find((c) => c?.id === courseId)?.role;

    const isOrganizationStaff =
        me?.organizationRole === RoleType.organizationAdmin ||
        me?.organizationRole === RoleType.organizationStaff;

    const isOrganizationStudent =
        me?.organizationRole === RoleType.organizationStudent ||
        me?.organizationRole === RoleType.organizationOther;

    const isCourseStaff =
        courseRole === RoleType.courseAdmin ||
        courseRole === RoleType.courseChecker ||
        courseRole === RoleType.courseEditor ||
        courseRole === RoleType.courseViewer;

    const isCourseStudent = courseRole === RoleType.courseStudent;

    if (
        (showSysAdminInterface && me?.isSysAdmin) ||
        (showStudentInterface && (isOrganizationStudent || isCourseStudent)) ||
        (showStaffInterface && (isOrganizationStaff || isCourseStaff)) ||
        // Might be a bit unsafe double check later
        (!showStudentInterface && !showStaffInterface && !showSysAdminInterface)
    ) {
        return <>{children}</>;
    }

    return <AccessErrorPage />;
};
