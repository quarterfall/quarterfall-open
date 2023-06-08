import { Permission } from "core";
import { useAssignment } from "features/assignment/student/Assignment.data";
import { assignmentWillOpen } from "features/assignment/utils/AssignmentUtils";
import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { usePermission } from "hooks/usePermission";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AssignmentStudentViewPage } from "routes/assignment/student/AssignmentStudentViewPage";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { Loading } from "ui/Loading";
import { useParams } from "ui/route/Params";

function AssignmentStudentHome() {
    const { id } = useParams<{ id: string }>();
    const can = usePermission();

    const { data, loading } = useAssignment(id);

    if (loading) {
        return <Loading />;
    }

    const assignment = data?.assignment;
    const module = assignment?.module;
    const course = module?.course;

    const isAssignmentClosed =
        !assignment ||
        assignmentWillOpen(assignment) ||
        (!can(Permission.testAssignment, course) &&
            !can(Permission.doAssignment, course));

    if (isAssignmentClosed) {
        return <AccessErrorPage />;
    } else {
        return (
            <RoleGuard showStudentInterface courseId={course?.id}>
                <AssignmentStudentViewPage assignment={assignment} />
            </RoleGuard>
        );
    }
}

export default () => (
    <AuthGuard>
        <AssignmentStudentHome />
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
