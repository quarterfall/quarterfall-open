import { RoleType } from "core";
import { useAssignment } from "features/assignment/staff/api/Assignment.data";
import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AssignmentFilesPage } from "routes/assignment/staff/AssignmentFilesPage";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { Loading } from "ui/Loading";
import { useParams } from "ui/route/Params";

function AssignmentFiles() {
    const { id } = useParams<{ id: string }>();
    const { data, loading } = useAssignment(id);

    if (loading) {
        return <Loading />;
    }

    const assignment = data?.assignment;
    const module = assignment?.module;
    const course = module?.course;
    if (course?.role === RoleType.courseStudent) {
        return <AccessErrorPage />;
    }

    return (
        <RoleGuard showStaffInterface courseId={course?.id}>
            <AssignmentFilesPage assignment={assignment} />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <AssignmentFiles />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "assignment",
        ])),
    },
});
