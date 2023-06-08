import { BlockType, Permission, RoleType } from "core";
import { useAssignment } from "features/assignment/staff/api/Assignment.data";
import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { QuestionAssessmentPage } from "features/question/staff/QuestionAssessmentPage";
import { usePermission } from "hooks/usePermission";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { PageNotFound } from "routes/error/PageNotFound";
import { Loading } from "ui/Loading";
import { useNavigation } from "ui/route/Navigation";
import { useParams } from "ui/route/Params";

function QuestionAssessment() {
    const { id, questionId } = useParams<{ id: string; questionId: string }>();
    const can = usePermission();
    const { data, loading } = useAssignment(id);
    const router = useNavigation();

    if (loading) {
        return <Loading />;
    }

    const assignment = data?.assignment;
    const module = assignment?.module;
    const course = module?.course;

    const blocks = data?.assignment?.blocks || [];
    const block = blocks.find((element) => element?.id === questionId);

    const canRead = can(Permission.readCourse, course);

    if (!canRead || course?.role === RoleType.courseStudent) {
        return <AccessErrorPage />;
    }

    if (!block) {
        return <PageNotFound />;
    }

    if (block.type === BlockType.Text) {
        router.push(`/assignment/${assignment?.id}/questions/${block?.id}`);
    }

    return (
        <RoleGuard showStaffInterface courseId={course?.id}>
            <QuestionAssessmentPage assignment={assignment} block={block} />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <QuestionAssessment />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "submission",
            "beacon",
            "assignment",
        ])),
    },
});
