import { Permission } from "core";
import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { useAssignment } from "features/course/staff/analytics/api/Analytics.data";
import { usePermission } from "hooks/usePermission";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { EditAssignmentAnalyticsBlockPage } from "routes/analytics/EditAssignmentAnalyticsBlockPage";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { Loading } from "ui/Loading";
import { useParams } from "ui/route/Params";

function EditAssignmentAnalyticsBlock() {
    const { id, blockId } = useParams<{
        id: string;
        blockId: string;
    }>();
    const can = usePermission();
    const { data, loading } = useAssignment(id);

    if (loading) {
        return <Loading />;
    }

    const assignment = data?.assignment;
    const module = assignment?.module;
    const course = module?.course;
    const analyticsBlock = (course?.analyticsBlocks || []).find(
        (b) => b.id === blockId
    );

    if (!analyticsBlock || !can(Permission.viewAnalytics, course)) {
        return <AccessErrorPage />;
    }

    return (
        <RoleGuard showStaffInterface courseId={course?.id}>
            <EditAssignmentAnalyticsBlockPage
                assignment={assignment}
                analyticsBlock={analyticsBlock}
            />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <EditAssignmentAnalyticsBlock />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "assignment",
            "course",
            "beacon",
            "analytics",
        ])),
    },
});
