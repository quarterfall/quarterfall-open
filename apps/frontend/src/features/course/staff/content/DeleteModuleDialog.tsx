import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Typography,
} from "@mui/material";
import { useToast } from "hooks/useToast";
import { Module } from "interface/Module.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { WaitingOverlay } from "ui/WaitingOverlay";
import { useDeleteModule } from "./api/Module.data";

export interface DeleteModuleDialogProps {
    module: Module;
    open: boolean;
    onClose?: () => void;
}

export function DeleteModuleDialog(props: DeleteModuleDialogProps) {
    const [deleteModuleMutation] = useDeleteModule();
    const { showSuccessToast } = useToast();
    const [deleting, setDeleting] = useState(false);
    const { t } = useTranslation();

    const { open, onClose, module } = props;

    const handleSubmit = async () => {
        setDeleting(true);
        await deleteModuleMutation({
            variables: {
                id: module.id,
            },
        });
        setDeleting(false);
        showSuccessToast(t("module:moduleDeletedNotification"));
        if (onClose) {
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{t("module:confirmDeleteModuleTitle")}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} direction="column">
                    <Grid item>
                        <Typography>
                            {t("module:confirmDeleteModuleMessage")}
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
                        data-cy="deleteModuleDialogSubmit"
                    >
                        {t("continue")}
                    </Button>
                </WaitingOverlay>
            </DialogActions>
        </Dialog>
    );
}
