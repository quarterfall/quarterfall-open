import { Permission } from "core";
import { useAssignment } from "features/assignment/staff/api/Assignment.data";
import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { usePermission } from "hooks/usePermission";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AssignmentSubmissionsPage } from "routes/assignment/staff/AssignmentSubmissionsPage";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { PageNotFound } from "routes/error/PageNotFound";
import { Loading } from "ui/Loading";
import { useParams } from "ui/route/Params";

function AssignmentSubmissions() {
    const { id } = useParams<{ id: string }>();
    const can = usePermission();

    const { data, loading } = useAssignment(id);

    if (loading) {
        return <Loading />;
    }

    const assignment = data?.assignment;
    const module = assignment?.module;
    const course = module?.course;

    if (!assignment) {
        return <PageNotFound />;
    }

    if (!can(Permission.readSubmission, course)) {
        return <AccessErrorPage />;
    }
    return (
        <RoleGuard showStaffInterface courseId={course?.id}>
            <AssignmentSubmissionsPage assignment={assignment} />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <AssignmentSubmissions />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "assignment",
            "submission",
            "user",
        ])),
    },
});
