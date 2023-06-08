import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useToast } from "hooks/useToast";
import { Submission } from "interface/Submission.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { ResizableCircle } from "ui/ResizableCircle";
import { WaitingOverlay } from "ui/WaitingOverlay";
import { useApproveSubmission } from "./Submission.data";

type Props = {
    showGradingActions?: boolean;
    submission?: Submission;
};

export const SubmissionHeaderGradingContainer = (props: Props) => {
    const { showGradingActions, submission } = props;
    const { t } = useTranslation();
    const { showSuccessToast } = useToast();

    const [waiting, setWaiting] = useState(false);
    const [unapproveDialogOpen, setUnapproveDialogOpen] = useState(false);
    const [approveSubmissionMutation] = useApproveSubmission();

    const assignment = submission?.assignment;

    const handleClickApprove = async () => {
        setWaiting(true);
        await approveSubmissionMutation({
            variables: {
                id: submission?.id,
            },
        });
        setWaiting(false);
        showSuccessToast();
    };

    return (
        <>
            <Box
                sx={{
                    ...(showGradingActions &&
                        assignment?.hasGrading && {
                            backgroundColor: "action.hover",
                            padding: 2,
                            paddingTop: 1,
                            paddingBottom: 1,
                            borderRadius: (theme) =>
                                `${theme.shape.borderRadius}px`,
                        }),
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    {assignment?.hasGrading && (
                        <Stack spacing={1} alignItems="center">
                            <ResizableCircle
                                text={
                                    !submission?.needsAssessment
                                        ? submission?.grade
                                        : "-"
                                }
                            />
                            {Boolean(submission?.score) && (
                                <Typography>
                                    {t("submission:totalScore")}:{" "}
                                    {submission?.score}
                                    {submission?.score <= 100 ? "/100" : ""}
                                </Typography>
                            )}
                        </Stack>
                    )}
                    {showGradingActions &&
                        assignment?.hasGrading &&
                        !submission?.isApproved && (
                            <WaitingOverlay waiting={waiting}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    color="primary"
                                    startIcon={<CheckCircleIcon />}
                                    disabled={
                                        waiting ||
                                        assignment.blocks.filter(
                                            (b) => !b.isAssessed
                                        ).length > 0
                                    }
                                    onClick={async () => {
                                        await handleClickApprove();
                                    }}
                                >
                                    {t("submission:approve")}
                                </Button>
                            </WaitingOverlay>
                        )}
                    {showGradingActions &&
                        assignment?.hasGrading &&
                        submission?.isApproved && (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setUnapproveDialogOpen(true)}
                            >
                                {t("submission:unapprove")}
                            </Button>
                        )}
                </Stack>
            </Box>
            <ConfirmationDialog
                open={unapproveDialogOpen}
                title={t("submission:confirmUnapproveTitle")}
                message={t("submission:confirmUnapproveMessage")}
                onContinue={() => {
                    handleClickApprove();
                    setUnapproveDialogOpen(false);
                }}
                onCancel={() => setUnapproveDialogOpen(false)}
            />
        </>
    );
};
