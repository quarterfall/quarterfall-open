import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ForwardIcon from "@mui/icons-material/Forward";
import {
    Button,
    CardActions,
    CardContent,
    CardHeader,
    Stack,
    useMediaQuery,
} from "@mui/material";
import { BlockType } from "core";
import { useUpdateAnswer } from "features/assignment/student/Assignment.data";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { CardWithBackground } from "ui/CardWithBackground";
import { WaitingOverlay } from "ui/WaitingOverlay";

import { FeedbackCard } from "./FeedbackCard";
import { SolutionCard } from "./SolutionCard";
import { ViewBlockCodeQuestion } from "./ViewBlockCodeQuestion";
import { ViewBlockFileUploadQuestion } from "./ViewBlockFileUploadQuestion";
import { ViewBlockMultipleChoiceQuestion } from "./ViewBlockMultipleChoiceQuestion";
import { ViewBlockOpenQuestion } from "./ViewBlockOpenQuestion";
import { ViewBlockText } from "./ViewBlockText";

export interface ViewQuestionProps {
    assignment: Assignment;
    index: number;
    block: Block;
    answer?: string[];
    feedbackWaiting?: boolean;
    completeWaiting?: boolean;
    readOnly?: boolean;
    showQuestionText?: boolean;
    showAnswer?: boolean;
    showFeedback?: boolean;
    showSolution?: boolean;
    answerInputLabel?: string;
    onUpdateAnswer?: () => void;
    onClickCompleteBlock?: () => void;
    onClickComputeFeedback?: () => void;
    onClickNextBlock?: () => void;
    onClickPreviousBlock?: () => void;
    answerChanged?: boolean;
    setAnswerChanged?: (answerChanged: boolean) => void;
    publicKey?: string;
}

export function ViewQuestion(props: ViewQuestionProps) {
    const { t } = useTranslation();
    const {
        assignment,
        index,
        block,
        answer,
        feedbackWaiting,
        completeWaiting,
        readOnly,
        showQuestionText,
        showAnswer,
        showFeedback,
        showSolution,
        answerInputLabel,
        onClickCompleteBlock,
        onClickComputeFeedback,
        onClickNextBlock,
        onClickPreviousBlock,
        answerChanged,
        setAnswerChanged,
        publicKey,
    } = props;

    const [updateAnswerMutation] = useUpdateAnswer();
    const { showSuccessToast } = useToast();
    const isMobile = useMediaQuery("(max-width:599px)");

    const feedback = block.feedback;
    const isBlockCompleted = block.completed;
    const hasGrading = assignment?.hasGrading;

    const handleUpdateAnswer = async (a: string[]) => {
        await updateAnswerMutation({
            variables: {
                id: block.id,
                data: a,
                publicKey,
            },
        });

        showSuccessToast();
        setAnswerChanged(true);
    };

    const handleComputeFeedback = () => {
        setAnswerChanged(false);
        if (onClickComputeFeedback) {
            onClickComputeFeedback();
        }
    };

    //For formative questions
    const canCompleteBlock = () => {
        if (
            (block.type === BlockType.MultipleChoiceQuestion &&
                !block.multipleCorrect &&
                !answer?.length) ||
            (block.type === BlockType.FileUploadQuestion &&
                !block?.files?.length)
        ) {
            // a student needs to provide an answer to a multiple choice question before being able to complete the block
            return false;
        } else {
            return (
                (block.actions || []).length === 0 ||
                (feedback?.attemptCount || 0) > 0
            );
        }
    };

    //For summative questions
    const handleClickNext = () => {
        if (readOnly || !hasGrading) {
            onClickNextBlock();
        }
        if (!isBlockCompleted) {
            onClickCompleteBlock();
        }
        onClickNextBlock();
    };

    return (
        <CardWithBackground index={index + 1}>
            <CardHeader
                title={`${
                    block.title
                        ? block.title
                        : `${t("assignment:question")}`.concat(
                              ` ${block.index + 1}`
                          )
                }`}
            />
            <CardContent>
                <Stack spacing={3} sx={{ maxWidth: "100%", overflow: "auto" }}>
                    {block.type === BlockType.Text && showQuestionText && (
                        <ViewBlockText assignment={assignment} block={block} />
                    )}
                    {block.type === BlockType.OpenQuestion && (
                        <ViewBlockOpenQuestion
                            assignment={assignment}
                            block={block}
                            answer={answer}
                            onUpdateAnswer={handleUpdateAnswer}
                            readOnly={readOnly}
                            answerInputLabel={answerInputLabel}
                            showQuestionText={showQuestionText}
                            showAnswer={showAnswer}
                        />
                    )}
                    {(block.type === BlockType.CodeQuestion ||
                        block.type === BlockType.DatabaseQuestion) && (
                        <ViewBlockCodeQuestion
                            assignment={assignment}
                            block={block}
                            answer={answer}
                            onUpdateAnswer={handleUpdateAnswer}
                            readOnly={readOnly}
                            answerInputLabel={answerInputLabel}
                            showQuestionText={showQuestionText}
                            showAnswer={showAnswer}
                        />
                    )}
                    {block.type === BlockType.MultipleChoiceQuestion && (
                        <ViewBlockMultipleChoiceQuestion
                            assignment={assignment}
                            block={block}
                            answer={answer}
                            onUpdateAnswer={handleUpdateAnswer}
                            readOnly={readOnly}
                            showSolution={showSolution}
                            showQuestionText={showQuestionText}
                            showAnswer={showAnswer}
                        />
                    )}
                    {block.type === BlockType.FileUploadQuestion && (
                        <ViewBlockFileUploadQuestion
                            assignment={assignment}
                            block={block}
                            answer={answer}
                            onUpdateAnswer={handleUpdateAnswer}
                            readOnly={readOnly}
                            answerInputLabel={answerInputLabel}
                            showQuestionText={showQuestionText}
                            setAnswerChanged={setAnswerChanged}
                        />
                    )}

                    {Boolean(block.actions?.length) && !readOnly && (
                        <Align right>
                            <WaitingOverlay waiting={feedbackWaiting}>
                                <Button
                                    color="primary"
                                    variant="contained"
                                    startIcon={<CheckIcon />}
                                    onClick={handleComputeFeedback}
                                    disabled={feedbackWaiting}
                                    size={isMobile ? "small" : "medium"}
                                >
                                    {t("assignment:checkAnswer")}
                                </Button>
                            </WaitingOverlay>
                        </Align>
                    )}

                    {showFeedback && feedback && (
                        <FeedbackCard
                            assignment={assignment}
                            feedback={feedback}
                        />
                    )}

                    {showSolution && block.hasSolution && (
                        <SolutionCard assignment={assignment} block={block} />
                    )}
                </Stack>
            </CardContent>
            <CardActions>
                <Align left>
                    {index > 0 && onClickPreviousBlock && (
                        <Button
                            startIcon={<ChevronLeftIcon />}
                            onClick={onClickPreviousBlock}
                        >
                            {t("previous")}
                        </Button>
                    )}
                </Align>
                <Align right>
                    {!hasGrading &&
                        !isBlockCompleted &&
                        !readOnly &&
                        index < assignment.blocks.length && (
                            <WaitingOverlay waiting={completeWaiting}>
                                <Button
                                    color="primary"
                                    onClick={() => {
                                        onClickCompleteBlock();
                                    }}
                                    endIcon={<ForwardIcon />}
                                    disabled={
                                        !canCompleteBlock() || completeWaiting
                                    }
                                    size={isMobile ? "small" : "medium"}
                                >
                                    {block.hasSolution
                                        ? t(
                                              "assignment:completeBlockAndShowSolution"
                                          )
                                        : t(
                                              "assignment:completeBlockAndGoToNext"
                                          )}
                                </Button>
                            </WaitingOverlay>
                        )}

                    {(hasGrading || isBlockCompleted) && onClickNextBlock && (
                        <Button
                            color="primary"
                            onClick={handleClickNext}
                            endIcon={<ForwardIcon />}
                            disabled={!canCompleteBlock}
                        >
                            {t("next")}
                        </Button>
                    )}
                </Align>
            </CardActions>
        </CardWithBackground>
    );
}
