import CommentIcon from "@mui/icons-material/Comment";
import { CardHeader, Paper, Stack, Typography } from "@mui/material";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import CollapsingCard from "ui/CollapsingCard";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));

interface ViewSubmissionFileUploadQuestionProps {
    assignment: Assignment;
    block: Block;
}

export function ViewSubmissionFileUploadQuestion(
    props: ViewSubmissionFileUploadQuestionProps
) {
    const { assignment, block } = props;
    const { t } = useTranslation();

    const studentComment = block?.answer?.length
        ? block?.answer[0]
        : block.template || "";

    return (
        <>
            <Stack spacing={2}>
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
                {block?.files?.map((file) => {
                    const markdown = `\`\`\`file \n label: ${file?.label}\n hasDownloadButton: true \n \`\`\``;
                    return (
                        <Paper
                            variant="outlined"
                            square
                            sx={{
                                border: (theme) =>
                                    `2px solid ${theme.palette.secondary.dark}`,
                                borderRadius: (theme) =>
                                    `${theme.shape.borderRadius}px`,

                                paddingLeft: 1,
                                paddingRight: 1,
                                paddingTop: 1,
                                paddingBottom: 2,
                            }}
                            key={file.id}
                        >
                            <Stack spacing={1}>
                                <Typography variant="caption">
                                    {t("assignment:answerOfStudent")}
                                </Typography>
                                <Stack spacing={1}>
                                    <Markdown files={block?.files}>
                                        {markdown}
                                    </Markdown>
                                </Stack>
                            </Stack>
                        </Paper>
                    );
                })}
            </Stack>
            {studentComment && (
                <CollapsingCard
                    title={t("assignment:studentComment")}
                    avatar={<CommentIcon color="secondary" fontSize="small" />}
                >
                    <Markdown files={assignment.files}>
                        {studentComment}
                    </Markdown>
                </CollapsingCard>
            )}
        </>
    );
}
