import { Permission } from "core";
import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { usePermission } from "hooks/usePermission";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useCourseAnalytics } from "routes/analytics/api/CourseAnalytics.data";
import { EditCourseAnalyticsBlockPage } from "routes/analytics/EditCourseAnalyticsBlockPage";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { Loading } from "ui/Loading";
import { useParams } from "ui/route/Params";

function EditCourseAnalyticsBlock() {
    const { id, blockId } = useParams<{ id: string; blockId: string }>();

    const { data, loading } = useCourseAnalytics(id);
    const can = usePermission();

    const course = data?.course;
    const analyticsBlock = (course?.analyticsBlocks || []).find(
        (b) => b.id === blockId
    );

    if (loading) {
        return <Loading />;
    }

    if (!analyticsBlock || !can(Permission.viewAnalytics, course)) {
        return <AccessErrorPage />;
    }

    return (
        <RoleGuard showStaffInterface courseId={id}>
            <EditCourseAnalyticsBlockPage
                course={course}
                analyticsBlock={analyticsBlock}
            />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <EditCourseAnalyticsBlock />
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
