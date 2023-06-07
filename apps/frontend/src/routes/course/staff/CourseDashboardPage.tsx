import { useStore } from "context/UIStoreProvider";
import { Permission, RoleType } from "core";
import { useCourseDashboard } from "features/course/staff/dashboard/api/CourseDashboard.data";
import { CourseStaffDashboard } from "features/course/staff/dashboard/CourseStaffDashboard";
import { usePermission } from "hooks/usePermission";
import { useEffect } from "react";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { useParams } from "ui/route/Params";

export function CourseDashboardPage() {
    const { id } = useParams<{ id: string }>();
    const { data, loading } = useCourseDashboard(id);

    const can = usePermission();
    const { setCourseId } = useStore();

    // if an id is passed, store the current course id
    useEffect(() => {
        if (id) {
            setCourseId(id);
        }
    }, [data]);

    const course = data?.course;

    if (
        data &&
        !loading &&
        (!can(Permission.readCourse, course) ||
            course?.role === RoleType.courseStudent)
    ) {
        return <AccessErrorPage />;
    }

    return <CourseStaffDashboard course={course} loading={loading} />;
}
