import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Typography,
} from "@mui/material";
import { useDeleteAssignment } from "features/assignment/staff/api/Assignment.data";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { WaitingOverlay } from "ui/WaitingOverlay";

export interface DeleteAssignmentDialogProps {
    assignment: Assignment;
    open: boolean;
    onClose?: () => void;
}

export function DeleteAssignmentDialog(props: DeleteAssignmentDialogProps) {
    const [deleteAssignmentMutation] = useDeleteAssignment();
    const { showSuccessToast } = useToast();
    const [deleting, setDeleting] = useState(false);
    const { t } = useTranslation();

    const { open, onClose, assignment } = props;

    const handleSubmit = async () => {
        setDeleting(true);
        await deleteAssignmentMutation({
            variables: {
                id: assignment.id,
            },
        });
        setDeleting(false);
        showSuccessToast(t("assignment:deletedConfirmation"));
        if (onClose) {
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{t("assignment:confirmDeleteTitle")}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} direction="column">
                    <Grid item>
                        <Typography>
                            {t("assignment:confirmDeleteMessage")}
                        </Typography>
                    </Grid>
                </Grid>
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
