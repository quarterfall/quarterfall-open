import { CardHeader, Paper, Stack, Typography } from "@mui/material";
import { ProgrammingLanguage } from "core";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));
const CodeViewer = dynamic(() => import("ui/code/CodeViewer"));

export interface ViewSubmissionCodeQuestionProps {
    assignment: Assignment;
    block: Block;
}

export const ViewSubmissionCodeQuestion = (
    props: ViewSubmissionCodeQuestionProps
) => {
    const { assignment, block } = props;
    const { t } = useTranslation();

    const answerValue = block?.answer?.length
        ? block?.answer[0]
        : block.template || "";

    return (
        <Stack spacing={1}>
            {block.text && (
                <CardHeader
                    title={
                        <Markdown files={assignment.files}>
                            {block.text}
                        </Markdown>
                    }
                    style={{ padding: 0 }}
                />
            )}
            <Paper
                variant="outlined"
                sx={{
                    border: (theme) =>
                        `2px solid ${theme.palette.secondary.dark}`,
                    borderRadius: (theme) => `${theme.shape.borderRadius}px`,
                    paddingLeft: 1,
                    paddingRight: 1,
                }}
            >
                <Typography variant="caption">
                    {t("assignment:answerOfStudent")}
                </Typography>
                <CodeViewer
                    elevation={0}
                    square
                    hideLineNumbers
                    value={
                        block?.programmingLanguage === ProgrammingLanguage.json
                            ? JSON.parse(answerValue)
                            : answerValue
                    }
                    language={block.programmingLanguage}
                />
            </Paper>
        </Stack>
    );
};
