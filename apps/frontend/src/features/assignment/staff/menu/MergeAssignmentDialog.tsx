import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Typography,
} from "@mui/material";
import { useMergeAssignment } from "features/assignment/staff/api/Assignment.data";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { WaitingOverlay } from "ui/WaitingOverlay";

export interface MergeAssignmentDialogProps {
    assignment: Assignment;
    open: boolean;
    onClose?: () => void;
}

export function MergeAssignmentDialog(props: MergeAssignmentDialogProps) {
    const [mergeAssignmentMutation] = useMergeAssignment();
    const { showSuccessToast } = useToast();
    const [merging, setMerging] = useState(false);
    const { t } = useTranslation();

    const { open, onClose, assignment } = props;

    const handleSubmit = async () => {
        setMerging(true);
        await mergeAssignmentMutation({
            variables: {
                id: assignment.id,
            },
        });
        setMerging(false);
        showSuccessToast(t("assignment:mergedConfirmation"));
        if (onClose) {
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{t("assignment:confirmMergeTitle")}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} direction="column">
                    <Grid item>
                        <Typography>
                            {t("assignment:confirmMergeMessage")}
                        </Typography>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t("cancel")}</Button>
                <WaitingOverlay waiting={merging}>
                    <Button
                        color="primary"
                        key={`${merging}`}
                        disabled={merging}
                        onClick={handleSubmit}
                    >
                        {t("continue")}
                    </Button>
                </WaitingOverlay>
            </DialogActions>
        </Dialog>
    );
}
