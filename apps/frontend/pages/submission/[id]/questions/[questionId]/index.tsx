import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { useSubmission } from "features/submission/Submission.data";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { PageNotFound } from "routes/error/PageNotFound";
import { SubmissionQuestionPage } from "routes/submission/SubmissionQuestionPage";
import { Loading } from "ui/Loading";
import { useParams } from "ui/route/Params";

function SubmissionQuestion() {
    const { id, questionId } = useParams<{
        id: string;
        questionId: string;
    }>();
    const { data, loading } = useSubmission(id);

    // if we are still waiting for the data, return the loading page
    if (loading) {
        return <Loading />;
    }
    const submission = data?.submission;
    const assignment = submission?.assignment;
    const module = assignment?.module;
    const course = module?.course;

    if (!submission) {
        return <PageNotFound />;
    }
    return (
        <RoleGuard showStaffInterface courseId={course?.id}>
            <SubmissionQuestionPage
                submission={submission}
                questionId={questionId}
            />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <SubmissionQuestion />
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
