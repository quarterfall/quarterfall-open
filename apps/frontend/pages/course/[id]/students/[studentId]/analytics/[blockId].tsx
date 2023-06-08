import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useCourseAnalytics } from "routes/analytics/api/CourseAnalytics.data";
import { EditStudentAnalyticsBlockPage } from "routes/analytics/EditStudentAnalyticsBlockPage";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { Loading } from "ui/Loading";
import { useParams } from "ui/route/Params";

function EditStudentAnalyticsBlock() {
    const { id, studentId, blockId } = useParams<{
        id: string;
        studentId: string;
        blockId: string;
    }>();

    const { data, loading } = useCourseAnalytics(id);

    if (loading) {
        return <Loading />;
    }

    const course = data?.course;

    // find the student
    const student = (course?.students || []).find((u) => u.id === studentId);

    const analyticsBlock = (course?.analyticsBlocks || []).find(
        (b) => b.id === blockId
    );

    if (!analyticsBlock || !student) {
        return <AccessErrorPage />;
    }

    return (
        <RoleGuard showStaffInterface courseId={id}>
            <EditStudentAnalyticsBlockPage
                course={course}
                student={student}
                analyticsBlock={analyticsBlock}
            />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <EditStudentAnalyticsBlock />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "analytics",
        ])),
    },
});
