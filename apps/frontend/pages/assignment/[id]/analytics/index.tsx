import { Permission } from "core";
import { useAssignment } from "features/assignment/staff/api/Assignment.data";
import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { usePermission } from "hooks/usePermission";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AssignmentAnalyticsPage } from "routes/assignment/staff/AssignmentAnalyticsPage";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { PageNotFound } from "routes/error/PageNotFound";
import { Loading } from "ui/Loading";
import { useParams } from "ui/route/Params";

function AssignmentAnalytics() {
    const { id } = useParams<{
        id: string;
    }>();
    const { data, loading } = useAssignment(id);

    const can = usePermission();

    if (loading) {
        return <Loading />;
    }

    // retrieve the course
    const assignment = data?.assignment;
    const module = assignment?.module;

    const course = module?.course;

    if (!assignment) {
        return <PageNotFound />;
    }

    if (!can(Permission.viewAnalytics, course)) {
        return <AccessErrorPage />;
    }

    return (
        <RoleGuard showStaffInterface courseId={course?.id}>
            <AssignmentAnalyticsPage course={course} assignment={assignment} />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <AssignmentAnalytics />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "course",
            "assignment",
            "analytics",
        ])),
    },
});
