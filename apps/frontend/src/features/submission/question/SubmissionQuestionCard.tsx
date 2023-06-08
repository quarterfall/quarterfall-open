import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import SolutionIcon from "@mui/icons-material/EmojiObjects";
import FeedbackIcon from "@mui/icons-material/Feedback";
import ForwardIcon from "@mui/icons-material/Forward";
import NotesIcon from "@mui/icons-material/Notes";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import {
    Alert,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Stack,
    Typography,
} from "@mui/material";
import { BlockType, ExitCode } from "core";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { Submission } from "interface/Submission.interface";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import CollapsingCard from "ui/CollapsingCard";
import { ViewSubmissionCodeQuestion } from "./ViewSubmissionCodeQuestion";
import { ViewSubmissionFileUploadQuestion } from "./ViewSubmissionFileUploadQuestion";
import { ViewSubmissionMultipleChoiceQuestion } from "./ViewSubmissionMultipleChoiceQuestion";
import { ViewSubmissionOpenQuestion } from "./ViewSubmissionOpenQuestion";
import { ViewSubmissionTextQuestion } from "./ViewSubmissionTextQuestion";
const Markdown = dynamic(() => import("ui/markdown/Markdown"));

export interface SubmissionQuestionCardProps {
    assignment: Assignment;
    index: number;
    block: Block;
    submission: Submission;
    showTitle: boolean;
    onClickNextBlock?: () => void;
    onClickPreviousBlock?: () => void;
}

export function SubmissionQuestionCard(props: SubmissionQuestionCardProps) {
    const {
        assignment,
        block,
        submission,
        index,
        onClickNextBlock,
        onClickPreviousBlock,
        showTitle = false,
    } = props;
    const { t } = useTranslation();

    return (
        <Card>
            {showTitle && (
                <CardHeader
                    title={` ${
                        block.title
                            ? block.title
                            : `${t("assignment:question")} ${block.index + 1}`
                    }`}
                />
            )}
            <CardContent>
                <Stack spacing={2}>
                    <CollapsingCard
                        title={t("assignment:questionTextAndStudentAnswer")}
                        defaultExpanded
                        avatar={
                            <TextSnippetIcon
                                color="secondary"
                                fontSize="small"
                            />
                        }
                    >
                        {block.type === BlockType.Text && (
                            <ViewSubmissionTextQuestion
                                assignment={assignment}
                                block={block}
                            />
                        )}
                        {block.type === BlockType.OpenQuestion && (
                            <ViewSubmissionOpenQuestion
                                assignment={assignment}
                                block={block}
                            />
                        )}
                        {(block.type === BlockType.CodeQuestion ||
                            block.type === BlockType.DatabaseQuestion) && (
                            <ViewSubmissionCodeQuestion
                                assignment={assignment}
                                block={block}
                            />
                        )}
                        {block.type === BlockType.MultipleChoiceQuestion && (
                            <ViewSubmissionMultipleChoiceQuestion
                                assignment={assignment}
                                block={block}
                            />
                        )}
                        {block.type === BlockType.FileUploadQuestion && (
                            <ViewSubmissionFileUploadQuestion
                                assignment={assignment}
                                block={block}
                            />
                        )}
                    </CollapsingCard>
                    {block?.feedback?.text?.length > 0 && (
                        <CollapsingCard
                            title={t("feedback")}
                            avatar={
                                <FeedbackIcon
                                    color="secondary"
                                    fontSize="small"
                                />
                            }
                        >
                            <Stack spacing={1} width="100%">
                                {block.feedback.code !== ExitCode.NoError && (
                                    <Alert
                                        severity="error"
                                        style={{ marginBottom: 8 }}
                                    >
                                        {t("assignment:resultCodeError", {
                                            code: block.feedback.code,
                                        })}
                                    </Alert>
                                )}
                                {block.feedback.text.map(
                                    (feedbackItem: string, index: number) => (
                                        <Markdown
                                            key={`feedback_${index}`}
                                            files={assignment.files}
                                        >
                                            {feedbackItem}
                                        </Markdown>
                                    )
                                )}
                                {block.feedback.code === ExitCode.NoError &&
                                    block.feedback.text.length === 0 && (
                                        <Typography>
                                            {t("assignment:resultNoFeedback")}
                                        </Typography>
                                    )}
                            </Stack>
                        </CollapsingCard>
                    )}
                    {block.hasSolution && block.solution && (
                        <CollapsingCard
                            title={t("solution")}
                            avatar={
                                <SolutionIcon
                                    color="secondary"
                                    fontSize="small"
                                />
                            }
                        >
                            <Markdown files={assignment.files}>
                                {block.solution}
                            </Markdown>
                        </CollapsingCard>
                    )}
                    {submission?.isApproved &&
                        block?.feedback?.justificationText && (
                            <CollapsingCard
                                title={t("submission:teacherComment")}
                                avatar={
                                    <NotesIcon
                                        color="secondary"
                                        fontSize="small"
                                    />
                                }
                            >
                                <Markdown files={assignment.files}>
                                    {block.feedback.justificationText}
                                </Markdown>
                            </CollapsingCard>
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
                    {index < assignment.blocks.length - 1 &&
                        onClickNextBlock && (
                            <Button
                                color="primary"
                                onClick={onClickNextBlock}
                                endIcon={<ForwardIcon />}
                            >
                                {t("next")}
                            </Button>
                        )}
                </Align>
            </CardActions>
        </Card>
    );
}
