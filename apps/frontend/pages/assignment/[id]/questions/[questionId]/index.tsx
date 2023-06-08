import { Permission, RoleType } from "core";
import { useAssignment } from "features/assignment/staff/api/Assignment.data";
import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { QuestionContentPage } from "features/question/staff/QuestionContentPage";
import { usePermission } from "hooks/usePermission";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { PageNotFound } from "routes/error/PageNotFound";
import { Loading } from "ui/Loading";
import { useParams } from "ui/route/Params";
function QuestionEditor() {
    const { id, questionId } = useParams<{ id: string; questionId: string }>();
    const can = usePermission();

    const { data, loading } = useAssignment(id);
    if (loading) {
        return <Loading />;
    }

    const assignment = data?.assignment;
    const module = assignment?.module;
    const course = module?.course;

    // get the block data
    const blocks = assignment?.blocks || [];
    const block = blocks.find((element) => element.id === questionId);

    const canRead = can(Permission.readCourse, course);

    if (!canRead || course?.role === RoleType.courseStudent) {
        return <AccessErrorPage />;
    }
    if (!block) {
        return <PageNotFound />;
    }

    return (
        <RoleGuard showStaffInterface courseId={course?.id}>
            <QuestionContentPage assignment={assignment} block={block} />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <QuestionEditor />
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
