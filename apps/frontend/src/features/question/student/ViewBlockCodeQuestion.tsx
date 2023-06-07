import RestoreIcon from "@mui/icons-material/Restore";
import { Button, Grid, Paper, Stack, Typography } from "@mui/material";
import { BlockType, ProgrammingLanguage } from "core";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";
import { CodeEditorController } from "ui/form/CodeEditorController";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));
const CodeViewer = dynamic(() => import("ui/code/CodeViewer"));

interface ViewBlockCodeQuestionProps {
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

export function ViewBlockCodeQuestion(props: ViewBlockCodeQuestionProps) {
    const { t } = useTranslation();

    const {
        assignment,
        block,
        answer = [],
        showAnswer,
        showQuestionText,
        debounce = true,
        answerInputLabel = t("assignment:answerInput"),
        onUpdateAnswer = (_: string[]) => void 0,
        readOnly,
        isPreview,
    } = props;

    // construct the default answer object
    const defaultValues = {
        answer: answer?.length ? answer[0] : block.template || "",
    };

    // make sure the programming language is always sql in case of a database question
    const programmingLanguage =
        block.type === BlockType.DatabaseQuestion
            ? ProgrammingLanguage.sql
            : block.programmingLanguage;

    // Form for storing the answer
    const { control, reset, watch } = useAutosaveForm<{ answer: string }>({
        defaultValues,
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
                <Grid item style={{ maxWidth: "100%" }}>
                    <Markdown files={assignment.files}>{block.text}</Markdown>
                </Grid>
            )}
            <Grid item>
                {!readOnly && (
                    <Stack
                        sx={{
                            width: "100%",
                            display: "flex",
                            paddingTop: 2,
                            ...(!(block.text && showQuestionText) && {
                                paddingTop: 8,
                            }),
                        }}
                        spacing={1}
                    >
                        <CodeEditorController
                            label={answerInputLabel}
                            language={programmingLanguage}
                            name="answer"
                            control={control}
                            disabled={readOnly}
                            resetToTemplateButton={
                                block.template && (
                                    <Button
                                        disabled={
                                            watch("answer") === block.template
                                        }
                                        onClick={() =>
                                            reset({
                                                answer: block.template || "",
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
                    </Stack>
                )}
                {readOnly && showAnswer && (
                    <Paper
                        variant="outlined"
                        square
                        style={{ paddingLeft: 8, paddingRight: 8 }}
                    >
                        <Typography variant="caption">
                            {answerInputLabel}
                        </Typography>
                        <CodeViewer
                            elevation={0}
                            square
                            hideLineNumbers
                            value={
                                block.programmingLanguage ===
                                ProgrammingLanguage.json
                                    ? JSON.parse(defaultValues.answer)
                                    : defaultValues.answer
                            }
                            language={block.programmingLanguage}
                        />
                    </Paper>
                )}
            </Grid>
        </Grid>
    );
}
