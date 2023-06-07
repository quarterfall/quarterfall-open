import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
    Typography,
} from "@mui/material";
import { organizationRoles, RoleType } from "core";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { EmailAddressesController } from "ui/form/EmailAddressesController";
import { SelectController } from "ui/form/SelectController";
import { useAddOrganizationUsers } from "../api/OrganizationUsers.data";

export interface AddOrganizationUsersDialogProps {
    open: boolean;
    onComplete?: () => void;
    onError?: (error) => void;
    onClose?: () => void;
}

export function AddOrganizationUsersDialog(
    props: AddOrganizationUsersDialogProps
) {
    const { t } = useTranslation();

    const [addOrganizationUsersMutation] = useAddOrganizationUsers();

    const {
        open,
        onClose = () => void 0,
        onComplete = () => void 0,
        onError = (error) => void 0,
    } = props;

    const onSubmit = async (input) => {
        try {
            await addOrganizationUsersMutation({
                variables: {
                    users: input.emailAddresses.map((emailAddress) => ({
                        emailAddress,
                    })),
                    role: input.role,
                },
            });
            onComplete();
        } catch (error) {
            onError(error);
        }
    };

    // Form for adding the users
    const {
        control,
        handleSubmit,
        formState: { isValid },
    } = useForm<{ emailAddresses: string[]; role: RoleType }>({
        mode: "onChange",
        defaultValues: {
            role: RoleType.organizationStudent,
        },
    });

    return (
        <Dialog open={open} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{t("organization:titleAddUsers")}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} direction="column">
                        <Grid item>
                            <Typography>
                                {t("organization:bodyAddUsers")}
                            </Typography>
                        </Grid>
                        {/* Email address input */}
                        <Grid item>
                            <EmailAddressesController
                                autoFocus
                                fullWidth
                                label={t("emailAddresses")}
                                name="emailAddresses"
                                control={control}
                                variant="outlined"
                                required
                            />
                        </Grid>
                        {/* Role selector */}
                        <Grid item>
                            <SelectController
                                style={{ minWidth: 200 }}
                                variant="outlined"
                                displayEmpty
                                label={t("role")}
                                name="role"
                                control={control}
                            >
                                {organizationRoles.map((role) => {
                                    return (
                                        <MenuItem
                                            key={`role_${role}`}
                                            value={role}
                                        >
                                            {t(`roles:${role}`)}
                                        </MenuItem>
                                    );
                                })}
                            </SelectController>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("cancel")}</Button>
                    <Button
                        type="submit"
                        color="primary"
                        key={`${!isValid}`}
                        disabled={!isValid}
                    >
                        {t("add")}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
