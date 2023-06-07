import FeedbackIcon from "@mui/icons-material/Feedback";
import ReceiptIcon from "@mui/icons-material/Receipt";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    IconButton,
    Typography,
} from "@mui/material";
import { ExitCode } from "core";
import { Assignment } from "interface/Assignment.interface";
import { Feedback } from "interface/Feedback.interface";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ViewLogDialog } from "./ViewLogDialog";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));

export interface FeedbackCardProps {
    assignment: Assignment;
    feedback: Feedback;
    teacherOnly?: boolean;
}

export function FeedbackCard(props: FeedbackCardProps) {
    const { assignment, feedback, teacherOnly } = props;

    const { t } = useTranslation();
    const [logDialogOpen, setLogDialogOpen] = useState(false);

    const {
        code = ExitCode.NoError,
        text = [],
        log = [],
        attemptCount,
    } = feedback;

    return (
        <>
            <Card
                elevation={0}
                sx={{
                    position: "relative",
                    paddingLeft: 0.5,
                    backgroundColor: "action.hover",
                    width: "100%",
                }}
            >
                <CardHeader
                    sx={{ padding: 1 }}
                    title={t("feedback")}
                    subheader={
                        attemptCount && !teacherOnly
                            ? t("submission:nrStudentTries", {
                                  count: attemptCount,
                              })
                            : undefined
                    }
                    avatar={<FeedbackIcon sx={{ color: "secondary.main" }} />}
                    action={
                        log &&
                        log.length > 0 && (
                            <IconButton
                                onClick={() => setLogDialogOpen(true)}
                                size="large"
                            >
                                <ReceiptIcon />
                            </IconButton>
                        )
                    }
                />
                <CardContent
                    sx={{
                        padding: 1,
                        paddingTop: 0,
                        overflowWrap: "break-word",
                    }}
                >
                    {code !== ExitCode.NoError && (
                        <Alert
                            severity="error"
                            action={
                                <Button onClick={() => setLogDialogOpen(true)}>
                                    {t("viewLog")}
                                </Button>
                            }
                            style={{ marginBottom: 8 }}
                        >
                            {t("assignment:resultCodeError", { code })}
                        </Alert>
                    )}
                    {text.map((feedbackItem: string, index: number) => (
                        <Markdown
                            key={`feedback_${index}`}
                            files={assignment.files}
                        >
                            {feedbackItem}
                        </Markdown>
                    ))}
                    {code === ExitCode.NoError && text.length === 0 && (
                        <Typography>
                            {t("assignment:resultNoFeedback")}
                        </Typography>
                    )}
                </CardContent>
                <Box
                    sx={{
                        position: "absolute",
                        width: "3px",
                        height: "100%",
                        top: 0,
                        left: 0,
                        backgroundColor: "secondary.main",
                    }}
                />
            </Card>

            <ViewLogDialog
                open={logDialogOpen}
                onClose={() => setLogDialogOpen(false)}
                code={code}
                log={log}
            />
        </>
    );
}
