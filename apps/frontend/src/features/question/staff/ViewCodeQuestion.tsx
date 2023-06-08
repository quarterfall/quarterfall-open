import RestoreIcon from "@mui/icons-material/Restore";
import { Button, Paper, Stack, Typography } from "@mui/material";
import { BlockType, ProgrammingLanguage } from "core";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { CodeEditor } from "ui/code/CodeEditor";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));
const CodeViewer = dynamic(() => import("ui/code/CodeViewer"));

interface ViewCodeQuestionProps {
    assignment: Assignment;
    block: Block;
    answer?: string[];
    showAnswer?: boolean;
    showQuestionText?: boolean;
    answerInputLabel?: string;
    onUpdateAnswer?: (answer: string[]) => void;
    readOnly?: boolean;
}

export function ViewCodeQuestion(props: ViewCodeQuestionProps) {
    const { t } = useTranslation();

    const {
        assignment,
        block,
        answer = [],
        showAnswer,
        showQuestionText,
        answerInputLabel = t("assignment:answerInput"),
        onUpdateAnswer = (_: string[]) => void 0,
        readOnly,
    } = props;

    // construct the default answer object
    const answerText = answer?.length ? answer[0] : block.template || "";

    // make sure the programming language is always sql in case of a database question
    const programmingLanguage =
        block.type === BlockType.DatabaseQuestion
            ? ProgrammingLanguage.sql
            : block.programmingLanguage;

    return (
        <Stack spacing={2}>
            {/* Question text */}
            {block.text && showQuestionText && (
                <Markdown files={assignment.files}>{block.text}</Markdown>
            )}

            {!readOnly && (
                <Stack
                    sx={{
                        width: "100%",
                        paddingTop: 1,
                        display: "flex",
                    }}
                    spacing={1}
                >
                    <CodeEditor
                        label={answerInputLabel}
                        language={programmingLanguage}
                        disabled={readOnly}
                        value={answerText}
                        onChange={(value) => onUpdateAnswer([value])}
                        resetToTemplateButton={
                            block.template && (
                                <Button
                                    disabled={answerText === block.template}
                                    onClick={() =>
                                        onUpdateAnswer([block.template || ""])
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
                            block?.programmingLanguage ===
                            ProgrammingLanguage.json
                                ? JSON.parse(answerText)
                                : answerText
                        }
                        language={block.programmingLanguage}
                    />
                </Paper>
            )}
        </Stack>
    );
}
