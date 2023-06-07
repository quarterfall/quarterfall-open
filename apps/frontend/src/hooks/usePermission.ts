import { useAuthContext } from "context/AuthProvider";
import { getParentPermission, Permission } from "core";
import { Course } from "interface/Course.interface";

export function usePermission() {
    const { me } = useAuthContext();
    const notAllowedPermissions = [
        Permission.createCourse,
        Permission.updateCourse,
        Permission.updateCourseUser,
        Permission.updateSubmission,
    ];

    return (permission: Permission, course?: Course) => {
        if (me?.isSysAdmin) {
            return true;
        }

        if (
            course?.archived &&
            notAllowedPermissions.indexOf(permission) !== -1
        ) {
            return false;
        }

        // construct the list of input permissions
        const input = [permission];
        const parent = getParentPermission(permission);
        if (parent) {
            input.push(parent);
        }

        // get all the permissions that the user has for the course and the organization
        const userPermissions: Permission[] = [
            ...(me?.organization?.permissions || []),
        ];
        if (course?.permissions) {
            userPermissions.push(...course?.permissions);
        }
        return input.some((p) => userPermissions.includes(p));
    };
}
