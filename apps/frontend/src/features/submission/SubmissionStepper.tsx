import { Box, Stack } from "@mui/material";
import { BlockType } from "core";
import { Submission } from "interface/Submission.interface";
import { SubmissionQuestionCard } from "./question/SubmissionQuestionCard";
import { SubmissionQuestionScoringCard } from "./question/SubmissionQuestionScoringCard";

export interface SubmissionStepperProps {
    submission: Submission;
    questionId: string;
    showGradingActions?: boolean;
}

export function SubmissionStepper(props: SubmissionStepperProps) {
    const { submission, questionId, showGradingActions } = props;

    const assignment = submission?.assignment;
    const blocks = assignment?.blocks;
    const block = blocks.find((block) => questionId === block.id);

    return (
        <Box flexGrow={1} flexWrap="nowrap">
            <Stack spacing={1}>
                {showGradingActions &&
                    assignment?.hasGrading &&
                    block.type !== BlockType.Text &&
                    !submission?.isApproved && (
                        <SubmissionQuestionScoringCard
                            block={block}
                            submission={submission}
                            assignment={assignment}
                        />
                    )}
                <SubmissionQuestionCard
                    assignment={assignment}
                    submission={submission}
                    index={block.index}
                    block={block}
                    showTitle={false}
                />
            </Stack>
        </Box>
    );
}
