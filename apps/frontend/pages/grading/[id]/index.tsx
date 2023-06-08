import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { useSubmission } from "features/submission/Submission.data";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { PageNotFound } from "routes/error/PageNotFound";
import { GradingPage } from "routes/grading/GradingPage";
import { Loading } from "ui/Loading";
import { useParams } from "ui/route/Params";

function Grading() {
    const { id } = useParams<{ id: string }>();
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
            <GradingPage submission={submission} />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <Grading />
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
