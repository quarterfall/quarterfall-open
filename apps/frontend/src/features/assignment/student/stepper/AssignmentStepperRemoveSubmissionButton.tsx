import RestoreIcon from "@mui/icons-material/Restore";
import { Button, useMediaQuery } from "@mui/material";
import { useDeleteSubmission } from "features/submission/Submission.data";
import { useToast } from "hooks/useToast";
import { Submission } from "interface/Submission.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { useNavigation } from "ui/route/Navigation";

interface AssignmentStepperRemoveSubmissionButtonProps {
    submission: Submission;
}

export const AssignmentStepperRemoveSubmissionButton = (
    props: AssignmentStepperRemoveSubmissionButtonProps
) => {
    const { submission } = props;
    const router = useNavigation();
    const { t } = useTranslation();
    const { showSuccessToast, showErrorToast } = useToast();
    const isDesktop = useMediaQuery("(min-width:850px)");

    const [removeSubmissionsDialogOpen, setRemoveSubmissionsDialogOpen] =
        useState(false);

    const [deleteSubmissionMutation] = useDeleteSubmission();

    const handleRemoveSubmission = async () => {
        try {
            await deleteSubmissionMutation({
                variables: {
                    id: submission?.id,
                },
            });
            showSuccessToast(t("submission:deletedNotification"));
            setRemoveSubmissionsDialogOpen(false);
            router.hardReload();
        } catch (e) {
            showErrorToast(t(e));
        }
    };
    return (
        <>
            <Button
                size="large"
                startIcon={<RestoreIcon />}
                color="error"
                onClick={() => {
                    setRemoveSubmissionsDialogOpen(true);
                }}
                sx={{
                    ...(isDesktop && {
                        marginTop: 1,
                        width: "98%",
                    }),
                }}
            >
                {t("assignment:resetAnswers")}
            </Button>
            <ConfirmationDialog
                open={removeSubmissionsDialogOpen}
                title={t("assignment:confirmRedoAssignmentTitle")}
                message={t("assignment:confirmRedoAssignmentMessage")}
                onContinue={handleRemoveSubmission}
                onCancel={() => {
                    setRemoveSubmissionsDialogOpen(false);
                }}
            />
        </>
    );
};
