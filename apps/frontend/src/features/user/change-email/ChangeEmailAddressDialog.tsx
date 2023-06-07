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
import { useAuthContext } from "context/AuthProvider";
import { extractErrorCode, patterns, ServerError } from "core";
import { useToast } from "hooks/useToast";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { WaitingOverlay } from "ui/WaitingOverlay";
import { useRequestChangeEmailAddress } from "../User.data";

export interface ChangeEmailAddressDialogProps {
    open: boolean;
    onClose?: () => void;
}

interface FormData {
    emailAddress: string;
}

export function ChangeEmailAddressDialog(props: ChangeEmailAddressDialogProps) {
    const { t } = useTranslation();
    const [requestChangeEmailAddress] = useRequestChangeEmailAddress();
    const { me } = useAuthContext();
    const { showErrorToast, showSuccessToast } = useToast();
    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isDirty },
    } = useForm({
        mode: "onChange",
        defaultValues: {
            emailAddress: me?.emailAddress,
        },
    });
    const [waiting, setWaiting] = useState(false);

    const { open, onClose } = props;

    const onSubmit = async (variables: FormData) => {
        try {
            setWaiting(true);
            await requestChangeEmailAddress({ variables });

            showSuccessToast(t("auth:emailAddressRequestSent"));
        } catch (error) {
            console.log(error);
            const errorCode = extractErrorCode(error);
            switch (errorCode) {
                case ServerError.EmailAddressAlreadyExists:
                    showErrorToast(t("auth:errorEmailAddressAlreadyExists"));
                    break;
                default:
                    showErrorToast(t("auth:errorGeneral"));
            }
        }
        setWaiting(false);
        if (onClose) {
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{t("user:titleChangeEmailAddress")}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} alignItems="flex-start">
                        <Typography>
                            {t("user:bodyChangeEmailAddress")}
                        </Typography>
                        {/* Email address input */}
                        <TextField
                            required
                            {...register("emailAddress", {
                                required: true,
                                pattern: {
                                    value: patterns.email,
                                    message: t("validationErrorEmailAddress"),
                                },
                            })}
                            autoFocus
                            disabled={waiting}
                            fullWidth
                            type="email"
                            label={t("emailAddress")}
                            variant="outlined"
                            error={Boolean(errors?.emailAddress)}
                            helperText={errors?.emailAddress?.message}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("cancel")}</Button>
                    <WaitingOverlay waiting={waiting}>
                        <Button
                            color="primary"
                            type="submit"
                            fullWidth
                            disabled={waiting || !isValid || !isDirty}
                        >
                            {t("continue")}
                        </Button>
                    </WaitingOverlay>
                </DialogActions>
            </form>
        </Dialog>
    );
}
