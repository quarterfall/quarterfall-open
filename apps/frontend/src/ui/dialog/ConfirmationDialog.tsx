import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { WaitingOverlay } from "ui/WaitingOverlay";

interface ConfirmationDialogProps {
    open?: boolean;
    title?: string;
    message: string;
    cancelButtonText?: string;
    continueButtonText?: string;
    onCancel?: () => void;
    onContinue?: () => void;
    onClick?: (event) => void;
    careful?: boolean;
    waiting?: boolean;
}

export function ConfirmationDialog(props: ConfirmationDialogProps) {
    const { t } = useTranslation();

    const {
        open = true,
        careful = false,
        title,
        message,
        cancelButtonText = t("cancel"),
        continueButtonText = t("continue"),
        onCancel,
        onContinue,
        onClick,
        waiting = false,
    } = props;

    return (
        <Dialog open={open} onClose={onCancel} onClick={onClick}>
            {title && <DialogTitle>{title}</DialogTitle>}
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            {!careful && (
                <DialogActions>
                    {onCancel && (
                        <Button onClick={onCancel}>{cancelButtonText}</Button>
                    )}
                    <WaitingOverlay waiting={waiting}>
                        <Button
                            data-cy="confirmationDialogSubmit"
                            color="primary"
                            onClick={onContinue}
                            disabled={waiting}
                        >
                            {continueButtonText}
                        </Button>
                    </WaitingOverlay>
                </DialogActions>
            )}
            {careful && (
                <DialogActions>
                    <WaitingOverlay waiting={waiting}>
                        <Button
                            onClick={onContinue}
                            color="error"
                            data-cy="confirmationDialogSubmit"
                            disabled={waiting}
                        >
                            {continueButtonText}
                        </Button>
                    </WaitingOverlay>
                    {onCancel && (
                        <Button onClick={onCancel} variant="outlined">
                            {cancelButtonText}
                        </Button>
                    )}
                </DialogActions>
            )}
        </Dialog>
    );
}
