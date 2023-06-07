import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";
import { useToast } from "hooks/useToast";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { WaitingOverlay } from "ui/WaitingOverlay";
import { useDeleteSubmissions } from "./Submission.data";

export interface DeleteSubmissionDialogProps {
    submissionIds: string[];
    open: boolean;
    onClose?: () => void;
}

export function DeleteSubmissionDialog(props: DeleteSubmissionDialogProps) {
    const [deleteSubmissionsMutation] = useDeleteSubmissions();
    const { showSuccessToast } = useToast();
    const [deleting, setDeleting] = useState(false);
    const { t } = useTranslation();

    const { open, onClose = () => void 0, submissionIds } = props;

    const handleSubmit = async () => {
        setDeleting(true);
        await deleteSubmissionsMutation({
            variables: {
                submissionIds,
            },
        });
        setDeleting(false);
        showSuccessToast(t("submission:deletedNotification"));
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                {t("submission:confirmDeleteSubmissionTitle")}
            </DialogTitle>
            <DialogContent>
                <Typography>
                    {t("submission:confirmDeleteSubmissionMessage")}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t("cancel")}</Button>
                <WaitingOverlay waiting={deleting}>
                    <Button
                        color="primary"
                        key={`${deleting}`}
                        disabled={deleting}
                        onClick={handleSubmit}
                    >
                        {t("continue")}
                    </Button>
                </WaitingOverlay>
            </DialogActions>
        </Dialog>
    );
}
