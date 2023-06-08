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
import { useMergeModule } from "./api/Module.data";

export interface MergeModuleDialogProps {
    module: Module;
    open: boolean;
    onClose?: () => void;
}

export function MergeModuleDialog(props: MergeModuleDialogProps) {
    const [mergeModuleMutation] = useMergeModule();
    const { showSuccessToast } = useToast();
    const [deleting, setDeleting] = useState(false);
    const { t } = useTranslation();

    const { open, onClose, module } = props;

    const handleSubmit = async () => {
        setDeleting(true);
        await mergeModuleMutation({
            variables: {
                id: module.id,
            },
        });
        setDeleting(false);
        showSuccessToast(t("module:moduleMergedNotification"));
        if (onClose) {
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{t("module:confirmMergeModuleTitle")}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} direction="column">
                    <Grid item>
                        <Typography>
                            {t("module:confirmMergeModuleMessage")}
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
