import { useStore } from "context/UIStoreProvider";
import { RoleType } from "core";
import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { useCourse } from "features/course/api/Course.data";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect } from "react";
import { CourseStudentDashboardPage } from "routes/course/student/CourseStudentDashboardPage";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { Loading } from "ui/Loading";
import { useParams } from "ui/route/Params";

function CourseStudentDashboard() {
    const { id } = useParams<{ id: string }>();
    const { data, loading } = useCourse(id);
    const { setCourseId } = useStore();

    // if an id is passed, store the current course id
    useEffect(() => {
        if (id) {
            setCourseId(id);
        }
    }, [data]);

    if (loading) {
        return <Loading />;
    }

    const course = data?.course;

    if (
        !(
            course?.role === RoleType.courseStudent ||
            course?.role === RoleType.courseAdmin
        )
    ) {
        return <AccessErrorPage />;
    }

    return (
        <RoleGuard showStudentInterface courseId={course?.id}>
            <CourseStudentDashboardPage course={course} />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <CourseStudentDashboard />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "assignment",
            "course",
            "module",
            "organization",
        ])),
    },
});
