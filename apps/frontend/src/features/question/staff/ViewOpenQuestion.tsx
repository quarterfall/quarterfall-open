import RestoreIcon from "@mui/icons-material/Restore";
import {
    Box,
    Button,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";

const MarkdownFieldController = dynamic(() =>
    import("ui/form/MarkdownFieldController").then(
        (mod) => mod.MarkdownFieldController
    )
);

const Markdown = dynamic(() => import("ui/markdown/Markdown"));

interface ViewOpenQuestionProps {
    assignment: Assignment;
    block: Block;
    answer?: string[];
    showAnswer?: boolean;
    showQuestionText?: boolean;
    answerInputLabel?: string;
    onUpdateAnswer?: (answer: string[]) => void;
    readOnly?: boolean;
}

export function ViewOpenQuestion(props: ViewOpenQuestionProps) {
    const { t } = useTranslation();
    const {
        assignment,
        block,
        answer = [],
        showAnswer,
        showQuestionText,
        readOnly,
        answerInputLabel = t("assignment:answerInput"),
        onUpdateAnswer = (_: string[]) => void 0,
    } = props;

    // construct the default answer object
    const answerText = answer?.length ? answer[0] : block.template || "";

    const { control, handleSubmit } = useAutosaveForm<{
        input: { answer: string };
    }>({ mode: "onChange" });
    const onSubmit = (input: { answer: string }) => {
        onUpdateAnswer([input.answer]);
    };

    return (
        <Stack spacing={2}>
            {/* Question text */}
            {block.text && showQuestionText && (
                <Markdown files={assignment.files}>{block.text}</Markdown>
            )}

            {!readOnly && (
                <Stack direction="row" sx={{ paddingTop: 1 }}>
                    {block.editor === "number" ? (
                        <TextField
                            fullWidth
                            label={answerInputLabel}
                            name="answer"
                            value={answerText}
                            onChange={(evt) =>
                                onUpdateAnswer([evt.target.value])
                            }
                            disabled={readOnly}
                        />
                    ) : (
                        <Box
                            component="form"
                            sx={{ width: "100%" }}
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <MarkdownFieldController
                                control={control}
                                fullWidth
                                label={answerInputLabel}
                                multiline
                                minRows={4}
                                variant="outlined"
                                name="answer"
                                value={answerText}
                                onChange={(evt) => {
                                    onUpdateAnswer([evt.target.value]);
                                }}
                                disabled={readOnly}
                                showPreviewToggle
                                action={
                                    block.template && (
                                        <Button
                                            disabled={
                                                answerText === block.template
                                            }
                                            onClick={() =>
                                                onUpdateAnswer([
                                                    block.template || "",
                                                ])
                                            }
                                            startIcon={<RestoreIcon />}
                                            size="small"
                                        >
                                            {t("assignment:resetToTemplate")}
                                        </Button>
                                    )
                                }
                            />
                        </Box>
                    )}
                </Stack>
            )}

            {readOnly && showAnswer && (
                <Paper
                    variant="outlined"
                    style={{ paddingLeft: 8, paddingRight: 8 }}
                >
                    <Typography variant="caption">
                        {answerInputLabel}
                    </Typography>
                    <Typography>
                        {answerText || t("assignment:noAnswerGiven")}
                    </Typography>
                </Paper>
            )}
        </Stack>
    );
}
