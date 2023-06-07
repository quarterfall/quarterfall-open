import { RoleType } from "core";
import { useAssignment } from "features/assignment/staff/api/Assignment.data";
import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AssignmentIntroductionPage } from "routes/assignment/staff/AssignmentIntroductionPage";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { PageNotFound } from "routes/error/PageNotFound";
import { Loading } from "ui/Loading";
import { useParams } from "ui/route/Params";

function AssignmentIntroduction() {
    const { id } = useParams<{ id: string }>();
    const { data, loading } = useAssignment(id);

    if (loading) {
        return <Loading />;
    }

    const assignment = data?.assignment;
    const module = assignment?.module;
    const course = module?.course;

    if (!assignment?.hasIntroduction) {
        return <PageNotFound />;
    }

    if (course?.role === RoleType.courseStudent) {
        return <AccessErrorPage />;
    }

    return (
        <RoleGuard showStaffInterface courseId={course?.id}>
            <AssignmentIntroductionPage assignment={assignment} />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <AssignmentIntroduction />
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
