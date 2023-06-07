import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useCourseAnalytics } from "routes/analytics/api/CourseAnalytics.data";
import { StudentAnalyticsPage } from "routes/analytics/StudentAnalyticsPage";
import { Loading } from "ui/Loading";
import { useParams } from "ui/route/Params";

function StudentAnalytics() {
    const { id } = useParams<{ id: string; studentId: string }>();
    const { data, loading } = useCourseAnalytics(id);

    if (loading) {
        return <Loading />;
    }

    // retrieve the course
    const course = data?.course;

    return (
        <RoleGuard showStaffInterface courseId={id}>
            <StudentAnalyticsPage course={course} />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <StudentAnalytics />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "analytics",
            "assignment",
            "course",
            "user",
        ])),
    },
});
