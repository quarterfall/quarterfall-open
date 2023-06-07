import { Stack } from "@mui/material";
import { useAuthContext } from "context/AuthProvider";
import { useResetAnonymousSubmission } from "features/submission/Submission.data";
import { Assignment } from "interface/Assignment.interface";
import { useNavigation } from "ui/route/Navigation";
import { AssignmentCompletedCard } from "./AssignmentCompletedCard";
import { AssignmentReviewCard } from "./AssignmentReviewCard";

interface AssignmentStepperFinalStepProps {
    assignment: Assignment;
    publicKey?: string;
    step?: number;
    handleClickPreviousQuestion?: () => void;
}

export const AssignmentStepperFinalStep = (
    props: AssignmentStepperFinalStepProps
) => {
    const { assignment, publicKey, step, handleClickPreviousQuestion } = props;
    const { me } = useAuthContext();
    const router = useNavigation();

    const [resetAnonymousSubmissionMutation] = useResetAnonymousSubmission();

    const handleResetAnonymousSubmission = async () => {
        await resetAnonymousSubmissionMutation({
            variables: {
                publicKey,
            },
        });
    };

    const handleClickResetAnswers = async () => {
        await handleResetAnonymousSubmission();
        router.hardReload();
    };

    return (
        <Stack flexGrow={1} maxWidth="100%" overflow="auto">
            {me && !publicKey ? (
                <AssignmentReviewCard
                    assignment={assignment}
                    index={step}
                    onClickPreviousBlock={handleClickPreviousQuestion}
                />
            ) : (
                <AssignmentCompletedCard
                    handleClickReset={handleClickResetAnswers}
                />
            )}
        </Stack>
    );
};
