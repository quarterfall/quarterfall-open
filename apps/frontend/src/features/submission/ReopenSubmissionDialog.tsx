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
import { useReopenSubmissions } from "./Submission.data";

export interface ReopenSubmissionDialogProps {
    submissionIds: string[];
    open: boolean;
    onClose?: () => void;
}

export function ReopenSubmissionDialog(props: ReopenSubmissionDialogProps) {
    const [reopenSubmissionsMutation] = useReopenSubmissions();
    const { showSuccessToast } = useToast();
    const [reopen, setReopen] = useState(false);
    const { t } = useTranslation();

    const { open, onClose = () => void 0, submissionIds } = props;

    const handleSubmit = async () => {
        setReopen(true);
        await reopenSubmissionsMutation({
            variables: {
                submissionIds,
            },
        });
        setReopen(false);
        showSuccessToast(t("submission:reopenedNotification"));
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                {t("submission:confirmReopenSubmissionTitle")}
            </DialogTitle>
            <DialogContent>
                <Typography>
                    {t("submission:confirmReopenSubmissionMessage")}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t("cancel")}</Button>
                <WaitingOverlay waiting={reopen}>
                    <Button
                        color="primary"
                        key={`${reopen}`}
                        disabled={reopen}
                        onClick={handleSubmit}
                    >
                        {t("continue")}
                    </Button>
                </WaitingOverlay>
            </DialogActions>
        </Dialog>
    );
}
