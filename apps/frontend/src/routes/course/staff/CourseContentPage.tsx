import { useStore } from "context/UIStoreProvider";
import { Permission, RoleType } from "core";
import { useCourseContent } from "features/course/staff/content/api/CourseContent.data";
import { CourseContent } from "features/course/staff/content/EditCourseContent";
import { usePermission } from "hooks/usePermission";
import { useEffect } from "react";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { useParams } from "ui/route/Params";

export function CourseContentPage() {
    const { id } = useParams<{ id: string }>();
    const { data, loading } = useCourseContent(id);
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
    } else {
        return <CourseContent course={course} loading={loading} />;
    }
}
