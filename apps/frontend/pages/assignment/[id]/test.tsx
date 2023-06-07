import { useAssignment } from "features/assignment/student/Assignment.data";
import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AssignmentTestPage } from "routes/assignment/staff/AssignmentTestPage";
import { Loading } from "ui/Loading";
import { useParams } from "ui/route/Params";

function AssignmentTest() {
    const { id } = useParams<{ id: string }>();

    const { data, loading } = useAssignment(id);
    if (loading) {
        return <Loading />;
    }

    const assignment = data?.assignment;
    const module = assignment?.module;
    const course = module?.course;

    return (
        <RoleGuard showStaffInterface courseId={course?.id}>
            <AssignmentTestPage assignment={assignment} />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <AssignmentTest />
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
        ])),
    },
});
