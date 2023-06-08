import AssessmentIcon from "@mui/icons-material/Assessment";
import CheckIcon from "@mui/icons-material/Check";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { BlockType } from "core";
import { useComputeFeedbackPreview } from "features/assignment/staff/api/Assignment.data";
import { FeedbackCard } from "features/question/student/FeedbackCard";
import { SolutionCard } from "features/question/student/SolutionCard";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { Feedback } from "interface/Feedback.interface";
import isEqual from "lodash/isEqual";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { WaitingOverlay } from "ui/WaitingOverlay";
import { ViewCodeQuestion } from "./ViewCodeQuestion";
import { ViewFileUploadQuestion } from "./ViewFileUploadQuestion";
import { ViewMultipleChoiceQuestion } from "./ViewMultipleChoiceQuestion";
import { ViewOpenQuestion } from "./ViewOpenQuestion";
import { ViewTextQuestion } from "./ViewTextQuestion";

export interface PreviewBlockProps {
    assignment: Assignment;
    block: Block;
    showSolution?: boolean;
    showCheckAnswer?: boolean;
    showAssessment?: boolean;
    readOnly?: boolean;
}

export function PreviewQuestion(props: PreviewBlockProps) {
    const { assignment, block, showSolution, showCheckAnswer, readOnly } =
        props;
    const { t } = useTranslation();
    const [feedbackWaiting, setFeedbackWaiting] = useState(false);
    const [computeFeedbackMutation] = useComputeFeedbackPreview();
    const [answer, setAnswer] = useState([block.template || ""]);
    const [feedback, setFeedback] = useState<Feedback | undefined>(undefined);

    const { showErrorToast } = useToast();

    const handleUpdateAnswer = (a: string[]) => {
        setAnswer(a);
        setFeedback(undefined);
    };

    const handleComputeFeedback = async () => {
        setFeedbackWaiting(true);
        try {
            const result = await computeFeedbackMutation({
                variables: {
                    id: block.id,
                    answer,
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
                },
            });
            setFeedback(result?.data?.computeFeedbackPreview);
        } catch (error) {
            showErrorToast(t("unknownError"));
        }
        setFeedbackWaiting(false);
    };

    useEffect(() => {
        setAnswer([block.template || ""]);
    }, [block.template]);

    return (
        <Stack spacing={2} maxWidth="100%" overflow="auto">
            {block.type === BlockType.Text && (
                <ViewTextQuestion assignment={assignment} block={block} />
            )}
            {block.type === BlockType.OpenQuestion && (
                <ViewOpenQuestion
                    assignment={assignment}
                    block={block}
                    answer={answer}
                    onUpdateAnswer={handleUpdateAnswer}
                    readOnly={readOnly}
                    showQuestionText
                />
            )}
            {(block.type === BlockType.CodeQuestion ||
                block.type === BlockType.DatabaseQuestion) && (
                <ViewCodeQuestion
                    assignment={assignment}
                    block={block}
                    answer={answer}
                    onUpdateAnswer={handleUpdateAnswer}
                    readOnly={readOnly}
                    showQuestionText
                />
            )}
            {block.type === BlockType.MultipleChoiceQuestion && (
                <ViewMultipleChoiceQuestion
                    assignment={assignment}
                    block={block}
                    answer={answer}
                    showQuestionText
                    isPreview
                    onUpdateAnswer={handleUpdateAnswer}
                    readOnly={readOnly}
                />
            )}
            {block.type === BlockType.FileUploadQuestion && (
                <ViewFileUploadQuestion
                    assignment={assignment}
                    block={block}
                    showCheckAnswer={showCheckAnswer}
                />
            )}

            {showCheckAnswer &&
                block.type !== BlockType.Text &&
                block.type !== BlockType.FileUploadQuestion &&
                !readOnly && (
                    <Align right>
                        <WaitingOverlay waiting={feedbackWaiting}>
                            <Button
                                color="primary"
                                startIcon={<CheckIcon />}
                                onClick={handleComputeFeedback}
                                disabled={feedbackWaiting}
                            >
                                {assignment?.hasGrading
                                    ? t("assignment:testAssessment")
                                    : t("assignment:checkAnswer")}
                            </Button>
                        </WaitingOverlay>
                    </Align>
                )}
            {feedback?.score !== undefined &&
                assignment.hasGrading &&
                !readOnly && (
                    <Alert icon={<AssessmentIcon />}>
                        <Typography>{`${t("score")}: ${
                            feedback?.score || 0
                        }`}</Typography>
                    </Alert>
                )}
            {feedback &&
                !readOnly &&
                !(
                    block.type === BlockType.MultipleChoiceQuestion &&
                    isEqual(feedback.text, [""])
                ) && (
                    <FeedbackCard assignment={assignment} feedback={feedback} />
                )}
            {showSolution && block.solution && !readOnly && (
                <SolutionCard assignment={assignment} block={block} />
            )}
        </Stack>
    );
}
