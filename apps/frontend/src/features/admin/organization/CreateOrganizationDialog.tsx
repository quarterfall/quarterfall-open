import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Typography,
} from "@mui/material";
import { patterns } from "core";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TextFieldController } from "ui/form/TextFieldController";
import { useNavigation } from "ui/route/Navigation";
import { WaitingOverlay } from "ui/WaitingOverlay";
import { useCreateOrganization } from "../api/Admin.data";

export interface CreateOrganizationDialogProps {
    open: boolean;
    onClose?: () => void;
    onComplete?: () => void;
    onError?: (error) => void;
}

export function CreateOrganizationDialog(props: CreateOrganizationDialogProps) {
    const { t } = useTranslation();
    const [createOrganizationMutation] = useCreateOrganization();
    const [creating, setCreating] = useState(false);
    const router = useNavigation();

    const {
        open = false,
        onClose = () => void 0,
        onComplete = () => void 0,
        onError = (error) => void 0,
    } = props;

    // Form for the organization creation
    const {
        control,
        handleSubmit,
        formState: { isValid },
    } = useForm({
        mode: "onChange",
    });

    const onSubmit = async (formData, valid) => {
        if (!valid) {
            return;
        }
        try {
            setCreating(true);
            const result = await createOrganizationMutation({
                variables: {
                    input: { ...formData },
                },
            });

            // update the current id to be the new course
            const organizationId = result.data?.createOrganization.id;
            if (organizationId) {
                router.push(`/admin/organization/${organizationId}`);
            }
            onComplete();
        } catch (error) {
            onError(error);
        }
        setCreating(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{t("organization:createDialogTitle")}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} direction="column">
                        <Grid item>
                            <Typography>
                                {t("organization:createDialogBody")}
                            </Typography>
                        </Grid>
                        {/* Organization name input */}
                        <Grid item>
                            <TextFieldController
                                control={control}
                                autoFocus
                                fullWidth
                                label={t("organization:name")}
                                name="name"
                                required
                            />
                        </Grid>

                        {/* Admin email address input */}
                        <Grid item>
                            <TextFieldController
                                label={t("organization:adminEmail")}
                                name="emailAddress"
                                control={control}
                                controllerProps={{
                                    rules: {
                                        pattern: {
                                            value: patterns.email,
                                            message: t(
                                                "validationErrorEmailAddress"
                                            ),
                                        },
                                    },
                                }}
                                required
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("cancel")}</Button>
                    <WaitingOverlay waiting={creating}>
                        <Button
                            type="submit"
                            color="primary"
                            key={`${!isValid || creating}`}
                            disabled={!isValid || creating}
                        >
                            {t("continue")}
                        </Button>
                    </WaitingOverlay>
                </DialogActions>
            </form>
        </Dialog>
    );
}
