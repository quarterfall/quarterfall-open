import { Stack } from "@mui/material";
import { SubmissionLayout } from "features/submission/layout/SubmissionLayout";
import { SubmissionHeader } from "features/submission/SubmissionHeader";
import { SubmissionStepper } from "features/submission/SubmissionStepper";
import { Submission } from "interface/Submission.interface";

interface SubmissionQuestionPageProps {
    submission?: Submission;
    questionId?: string;
}

export function SubmissionQuestionPage(props: SubmissionQuestionPageProps) {
    const { submission, questionId } = props;

    return (
        <SubmissionLayout submission={submission} questionId={questionId}>
            <Stack spacing={1}>
                <SubmissionHeader submission={submission} />
                <SubmissionStepper
                    submission={submission}
                    questionId={questionId}
                />
            </Stack>
        </SubmissionLayout>
    );
}
