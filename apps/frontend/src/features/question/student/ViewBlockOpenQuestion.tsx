import RestoreIcon from "@mui/icons-material/Restore";
import { Button, Grid, Paper, Stack, Typography } from "@mui/material";
import { EditorType, isFloat } from "core";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";
import { TextFieldController } from "ui/form/TextFieldController";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));
const MarkdownFieldController = dynamic(() =>
    import("ui/form/MarkdownFieldController").then(
        (mod) => mod.MarkdownFieldController
    )
);

interface ViewBlockOpenQuestionProps {
    assignment: Assignment;
    block: Block;
    answer?: string[];
    showAnswer?: boolean;
    showQuestionText?: boolean;
    debounce?: boolean;
    answerInputLabel?: string;
    onUpdateAnswer?: (answer: string[]) => void;
    readOnly?: boolean;
    isPreview?: boolean;
}

export function ViewBlockOpenQuestion(props: ViewBlockOpenQuestionProps) {
    const { t } = useTranslation();
    const {
        assignment,
        block,
        answer = [],
        showAnswer,
        showQuestionText,
        readOnly,
        isPreview,
        debounce = true,
        answerInputLabel = t("assignment:answerInput"),
        onUpdateAnswer = (_: string[]) => void 0,
    } = props;

    // construct the default answer object
    const defaultValues = {
        answer: answer?.length ? answer[0] : block.template || "",
    };

    // Form for storing the answer
    const { control, reset, watch } = useAutosaveForm<{ answer: string }>({
        onSave: async (input) => {
            if (!debounce) {
                return;
            }
            onUpdateAnswer([input.answer || ""]);
        },
        onChange: async (input) => {
            if (debounce) {
                return;
            }
            onUpdateAnswer([input.answer || ""]);
        },
        defaultValues,
    });

    // if the block changes, reset the answer field
    useEffect(() => {
        reset(defaultValues);
    }, [block.id]);

    // if the template changes, update the answer field value
    useEffect(() => {
        if (!isPreview) {
            return;
        }
        reset({ answer: block.template || "" });
    }, [block.template]);

    return (
        <Grid container direction="column" spacing={3}>
            {/* Question text */}
            {block.text && showQuestionText && (
                <Grid item sx={{ maxWidth: "100%", paddingTop: 1 }}>
                    <Markdown files={assignment.files}>{block.text}</Markdown>
                </Grid>
            )}
            <Grid item>
                {!readOnly && (
                    <Stack
                        width="100%"
                        spacing={1}
                        direction="row"
                        sx={{ paddingTop: 0.5 }}
                    >
                        {block.editor === "number" ? (
                            <TextFieldController
                                fullWidth
                                label={answerInputLabel}
                                multiline
                                name="answer"
                                control={control}
                                controllerProps={{
                                    rules: {
                                        validate: {
                                            float: (v) => {
                                                return (
                                                    block.editor !==
                                                        EditorType.Number ||
                                                    isFloat(v) ||
                                                    (t(
                                                        "validationErrorInvalidNumber"
                                                    ) as string)
                                                );
                                            },
                                        },
                                    },
                                }}
                                disabled={readOnly}
                            />
                        ) : (
                            <MarkdownFieldController
                                control={control}
                                label={answerInputLabel}
                                fullWidth
                                multiline
                                minRows={4}
                                name="answer"
                                disabled={readOnly}
                                showPreviewToggle
                                action={
                                    block.template && (
                                        <Button
                                            disabled={
                                                watch("answer") ===
                                                block.template
                                            }
                                            onClick={() =>
                                                reset({
                                                    answer:
                                                        block.template || "",
                                                })
                                            }
                                            startIcon={<RestoreIcon />}
                                            size="small"
                                        >
                                            {t("assignment:resetToTemplate")}
                                        </Button>
                                    )
                                }
                            />
                        )}
                    </Stack>
                )}
                {readOnly && showAnswer && (
                    <Paper
                        variant="outlined"
                        style={{
                            paddingLeft: 8,
                            paddingRight: 8,
                        }}
                    >
                        <Typography variant="caption">
                            {answerInputLabel}
                        </Typography>
                        <Typography>
                            {defaultValues.answer ||
                                t("assignment:noAnswerGiven")}
                        </Typography>
                    </Paper>
                )}
            </Grid>
        </Grid>
    );
}
