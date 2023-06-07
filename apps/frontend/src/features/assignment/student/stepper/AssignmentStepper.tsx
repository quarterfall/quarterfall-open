import { Box, Grid, Stack, useMediaQuery } from "@mui/material";

import { useAuthContext } from "context/AuthProvider";
import { ViewQuestion } from "features/question/student/ViewQuestion";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { Submission } from "interface/Submission.interface";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    useCompleteBlock,
    useComputeFeedback,
    useRecordAssignmentActivity,
} from "../Assignment.data";
import { AssignmentIntroductionCard } from "./AssignmentIntroductionCard";
import { AssignmentStepperFinalStep } from "./AssignmentStepperFinalStep";

export interface AssignmentStepperProps {
    assignment: Assignment;
    submission?: Submission;
    publicKey?: string;
    params?: any;
    updateParams?: (params: any) => void;
}

export function AssignmentStepper(props: AssignmentStepperProps) {
    const { assignment, submission, publicKey, params, updateParams } = props;
    const { t } = useTranslation();
    const { showErrorToast } = useToast();
    const { me } = useAuthContext();
    const isDesktop = useMediaQuery("(min-width:850px)");

    const [answerChanged, setAnswerChanged] = useState(true);
    const [feedbackWaiting, setFeedbackWaiting] = useState(false);
    const [completeWaiting, setCompleteWaiting] = useState(false);

    const [computeFeedbackMutation] = useComputeFeedback();
    const [completeBlockMutation] = useCompleteBlock();
    const [recordAssignmentActivityMutation] = useRecordAssignmentActivity();

    const blocks = assignment.blocks || [];
    const activeBlock =
        blocks.length > 0 && params.step < blocks.length
            ? { ...blocks[params.step] }
            : null;

    const hasGrading = assignment?.hasGrading;

    const handleComputeFeedback = async () => {
        if (!activeBlock) {
            return;
        }
        setFeedbackWaiting(true);
        try {
            await computeFeedbackMutation({
                variables: {
                    id: activeBlock.id,
                    languageData: {
                        queryResultTitle: t("assignment:queryResultTitle"),
                        testResultTitle: t("assignment:testResultTitle"),
                        testInternalErrorMessage: t(
                            "assignment:testInternalErrorMessage"
                        ),
                        testTimeoutErrorMessage: t(
                            "assignment:testTimeoutErrorMessage"
                        ),
                        testResultSuccess: t("assignment:testResultSuccess"),
                        testResultFail: t("assignment:testResultFail"),
                    },
                    publicKey,
                },
            });
        } catch (error) {
            showErrorToast(t("unknownError"));
        }

        setFeedbackWaiting(false);
    };

    const handleCompleteBlock = async () => {
        if (!activeBlock) {
            return;
        }
        setCompleteWaiting(true);
        await completeBlockMutation({
            variables: {
                id: activeBlock.id,
                publicKey,
            },
        });
        setCompleteWaiting(false);
        if (!activeBlock.hasSolution) {
            // go to the next block immediately
            updateParams({ step: params.step + 1 });
        }
    };

    const handleClickNextBlock = () => {
        updateParams({ step: params.step + 1 });
    };

    const handleClickPreviousBlock = () => {
        updateParams({ step: params.step - 1 });
    };

    useEffect(() => {
        if (me && !publicKey && submission) {
            recordAssignmentActivityMutation({
                variables: { id: submission?.id },
            });
        }
    }, []);

    return (
        <Stack
            direction={isDesktop ? "row" : "column"}
            spacing={1}
            flexWrap="nowrap"
            maxWidth="100%"
        >
            {activeBlock && (
                <Box flexGrow={1} maxWidth="100%" overflow="auto">
                    <Grid container spacing={1}>
                        {assignment.hasIntroduction &&
                            assignment?.introduction && (
                                <Grid item xs={12}>
                                    <AssignmentIntroductionCard
                                        assignment={assignment}
                                        hideTitle
                                    />
                                </Grid>
                            )}
                        <Grid item xs={12}>
                            <ViewQuestion
                                assignment={assignment}
                                index={params.step}
                                block={activeBlock}
                                answer={activeBlock.answer}
                                onClickCompleteBlock={handleCompleteBlock}
                                onClickComputeFeedback={handleComputeFeedback}
                                onClickPreviousBlock={handleClickPreviousBlock}
                                onClickNextBlock={handleClickNextBlock}
                                feedbackWaiting={feedbackWaiting}
                                completeWaiting={completeWaiting}
                                showQuestionText
                                showAnswer
                                showFeedback
                                showSolution={
                                    !hasGrading && activeBlock.completed
                                }
                                readOnly={!hasGrading && activeBlock.completed}
                                answerChanged={answerChanged}
                                setAnswerChanged={setAnswerChanged}
                                publicKey={publicKey}
                            />
                        </Grid>
                    </Grid>
                </Box>
            )}
            {params.step === blocks.length && (
                <AssignmentStepperFinalStep
                    assignment={assignment}
                    step={params.step}
                    publicKey={publicKey}
                    handleClickPreviousQuestion={handleClickPreviousBlock}
                />
            )}
        </Stack>
    );
}
