import { Stack } from "@mui/material";
import { SubmissionLayout } from "features/submission/layout/SubmissionLayout";
import { SubmissionHeader } from "features/submission/SubmissionHeader";
import { SubmissionStepper } from "features/submission/SubmissionStepper";
import { Submission } from "interface/Submission.interface";

type GradingQuestionPageProps = { submission: Submission; questionId: string };

export const GradingQuestionPage = (props: GradingQuestionPageProps) => {
    const { submission, questionId } = props;
    const assignment = submission?.assignment;
    const module = assignment?.module;
    const course = module?.course;
    return (
        <SubmissionLayout
            submission={submission}
            questionId={questionId}
            showGradingActions
        >
            <Stack spacing={1}>
                <SubmissionHeader
                    submission={submission}
                    showGradingActions={!course?.archived}
                />
                <SubmissionStepper
                    submission={submission}
                    questionId={questionId}
                    showGradingActions
                />
            </Stack>
        </SubmissionLayout>
    );
};
