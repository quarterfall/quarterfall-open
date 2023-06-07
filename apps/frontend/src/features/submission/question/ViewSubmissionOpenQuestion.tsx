import { Paper, Stack, Typography } from "@mui/material";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));

export interface ViewSubmissionOpenQuestionProps {
    assignment: Assignment;
    block: Block;
}

export const ViewSubmissionOpenQuestion = (
    props: ViewSubmissionOpenQuestionProps
) => {
    const { assignment, block } = props;
    const { t } = useTranslation();

    const answerValue = block?.answer?.length
        ? block?.answer[0]
        : block.template || "";

    return (
        <Stack spacing={1}>
            {block.text && (
                <Markdown files={assignment.files}>{block.text}</Markdown>
            )}
            <Paper
                variant="outlined"
                square
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
                <Markdown files={assignment.files}>
                    {answerValue || t("assignment:noAnswerGiven")}
                </Markdown>
            </Paper>
        </Stack>
    );
};
