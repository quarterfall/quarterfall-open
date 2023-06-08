import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

export interface DeleteOrganizationSchemeDialogProps {
    open: boolean;
    onClose?: () => void;
    onDelete?: () => void;
}

export function DeleteOrganizationSchemeDialog(
    props: DeleteOrganizationSchemeDialogProps
) {
    const { open, onClose, onDelete } = props;
    const { t } = useTranslation();

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                {t("organization:confirmDeleteSchemeTitle")}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} direction="column">
                    <Grid item>
                        <Typography>
                            {t("organization:confirmDeleteSchemeMessage")}
                        </Typography>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t("cancel")}</Button>
                <Button
                    color="primary"
                    onClick={() => {
                        onDelete();
                        onClose();
                    }}
                >
                    {t("continue")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
