import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useToast } from "hooks/useToast";
import { Organization } from "interface/Organization.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "ui/route/Navigation";
import { WaitingOverlay } from "ui/WaitingOverlay";
import { useDeleteOrganization } from "../api/Admin.data";

export interface DeleteOrganizationDialogProps {
    organization: Organization;
    open: boolean;
    onClose?: () => void;
}

export function DeleteOrganizationDialog(props: DeleteOrganizationDialogProps) {
    const [deleteOrganizationMutation] = useDeleteOrganization();
    const { showSuccessToast } = useToast();
    const [deleting, setDeleting] = useState(false);
    const { t } = useTranslation();
    const [doit, setDoit] = useState("");
    const router = useNavigation();

    const { open, onClose, organization } = props;

    const handleSubmit = async () => {
        setDeleting(true);
        await deleteOrganizationMutation({
            variables: {
                id: organization.id,
            },
        });
        setDeleting(false);
        showSuccessToast(
            t("organization:deletedConfirmation", { name: organization.name })
        );
        if (onClose) {
            onClose();
        }
        router.push("/admin");
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{t("organization:confirmDeleteTitle")}</DialogTitle>
            <DialogContent>
                <Stack spacing={1}>
                    <Typography>
                        {t("organization:confirmDeleteMessage")}
                    </Typography>
                    <TextField
                        variant="outlined"
                        value={doit}
                        onChange={(evt) => setDoit(evt.target.value)}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t("cancel")}</Button>
                <WaitingOverlay waiting={deleting}>
                    <Button
                        color="primary"
                        key={`${deleting}`}
                        disabled={doit !== "DOIT" || deleting}
                        onClick={handleSubmit}
                    >
                        {t("continue")}
                    </Button>
                </WaitingOverlay>
            </DialogActions>
        </Dialog>
    );
}
