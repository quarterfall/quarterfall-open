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
import { useAuthContext } from "context/AuthProvider";
import { organizationRoles, RoleType } from "core";
import { User } from "interface/User.interface";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { SelectController } from "ui/form/SelectController";
import { TextFieldController } from "ui/form/TextFieldController";
import { useNavigation } from "ui/route/Navigation";
import { useUpdateUser } from "../api/OrganizationUsers.data";

export interface EditOrganizationUserDialogProps {
    user?: User;
    onComplete?: () => void;
    onError?: (error) => void;
    onClose?: () => void;
}

export function EditOrganizationUserDialog(
    props: EditOrganizationUserDialogProps
) {
    const {
        onClose = () => void 0,
        onComplete = () => void 0,
        onError = (error) => void 0,
        user,
    } = props;
    const { me } = useAuthContext();
    const { t } = useTranslation();
    const [confirmRemoveAdminOpen, setConfirmRemoveAdminOpen] = useState(false);
    const [updateUserMutation] = useUpdateUser();
    const router = useNavigation();

    const doUpdateUser = async (input: any, toHome: boolean = false) => {
        setConfirmRemoveAdminOpen(false);

        // remove unchanged input elements
        if (user?.firstName === input.firstName) {
            delete input.firstName;
        }
        if (user?.lastName === input.lastName) {
            delete input.lastName;
        }
        if (user?.emailAddress === input.emailAddress) {
            delete input.emailAddress;
        }
        if (user?.organizationRole === input.organizationRole) {
            delete input.organizationRole;
        }

        // don't do anything if nothing changed
        if (Object.keys(input).length === 0) {
            onClose();
            return;
        }
        try {
            await updateUserMutation({
                variables: {
                    id: user?.id,
                    input,
                },
            });
            onComplete();
            if (toHome) {
                router.push("/");
            }
        } catch (error) {
            onError(error);
        }
    };

    const onSubmit = async (input) => {
        // update the role if needed
        if (
            me?.id === user?.id &&
            user?.organizationRole === RoleType.organizationAdmin &&
            input.organizationRole !== RoleType.organizationAdmin
        ) {
            setConfirmRemoveAdminOpen(true);
        } else {
            doUpdateUser(input);
        }
    };

    const defaultValues = {
        firstName: user?.firstName,
        lastName: user?.lastName,
        emailAddress: user?.emailAddress,
        organizationRole:
            user?.organizationRole || RoleType.organizationStudent,
    };

    // Form for editing the user role
    const {
        control,
        handleSubmit,
        formState: { isValid },
        watch,
        reset,
    } = useForm({
        mode: "onChange",
        defaultValues,
    });

    useEffect(() => {
        reset(defaultValues);
    }, [user?.id]);

    return (
        <>
            <Dialog open={Boolean(user)} onClose={onClose}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>{t("organization:titleEditUser")}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} direction="column">
                            <Grid item>
                                <Typography>
                                    {t("organization:bodyEditUser")}
                                </Typography>
                            </Grid>
                            {/* First name */}
                            <Grid item>
                                <TextFieldController
                                    control={control}
                                    fullWidth
                                    autoFocus
                                    label={t("user:firstName")}
                                    name="firstName"
                                />
                            </Grid>
                            {/* Last name */}
                            <Grid item>
                                <TextFieldController
                                    control={control}
                                    fullWidth
                                    label={t("user:lastName")}
                                    name="lastName"
                                />
                            </Grid>
                            {/* Email address */}
                            <Grid item>
                                <TextFieldController
                                    control={control}
                                    fullWidth
                                    type="email"
                                    label={t("emailAddress")}
                                    name="emailAddress"
                                />
                            </Grid>
                            {/* Role selector */}
                            <Grid item>
                                <SelectController
                                    control={control}
                                    style={{ minWidth: 200 }}
                                    displayEmpty
                                    label={t("role")}
                                    name="organizationRole"
                                    variant="outlined"
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
                            {t("ok")}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            <ConfirmationDialog
                careful
                title={t(
                    "organization:titleConfirmRemoveYourselfAdministrator"
                )}
                message={t(
                    "organization:bodyConfirmRemoveYourselfAdministrator"
                )}
                open={confirmRemoveAdminOpen}
                onContinue={() =>
                    doUpdateUser(
                        { organizationRole: watch("organizationRole") },
                        true
                    )
                }
                onCancel={() => setConfirmRemoveAdminOpen(false)}
            />
        </>
    );
}
