import { useAssignment } from "features/assignment/staff/api/Assignment.data";
import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AssignmentHomePage } from "routes/assignment/staff/AssignmentHomePage";
import { Loading } from "ui/Loading";
import { useParams } from "ui/route/Params";

function AssignmentHome() {
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
            <AssignmentHomePage assignment={assignment} />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <AssignmentHome />
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
