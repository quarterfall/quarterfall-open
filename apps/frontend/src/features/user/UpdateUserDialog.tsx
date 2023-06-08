import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from "@mui/material";
import { useAuthContext } from "context/AuthProvider";
import { User } from "interface/User.interface";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TextFieldController } from "ui/form/TextFieldController";
import { WaitingOverlay } from "ui/WaitingOverlay";
import { useUpdateMe } from "./User.data";

type UpdateUserDialogProps = {
    open?: boolean;
    onClose?: () => void;
};

export const UpdateUserDialog = (props: UpdateUserDialogProps) => {
    const { open, onClose } = props;
    const { t } = useTranslation();
    const [updateMeMutation] = useUpdateMe();
    const { me } = useAuthContext();
    const [waiting, setWaiting] = useState(false);

    const {
        formState: { isValid },
        control,
        handleSubmit,
    } = useForm({ mode: "onChange" });

    const onSubmit = async (input: Partial<User>) => {
        setWaiting(true);
        await updateMeMutation({
            variables: {
                id: me?.id,
                input,
            },
        });
        setWaiting(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{t("noNameLoginTitle")}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} width="100%">
                        <Typography>{t("noNameLoginBody")}</Typography>
                        <TextFieldController
                            fullWidth
                            required
                            label={t("user:firstName")}
                            name="firstName"
                            control={control}
                        />
                        <TextFieldController
                            fullWidth
                            required
                            label={t("user:lastName")}
                            name="lastName"
                            control={control}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <WaitingOverlay waiting={waiting}>
                        <Button
                            type="submit"
                            color="primary"
                            key={`${!isValid || waiting}`}
                            disabled={!isValid || waiting}
                        >
                            {t("save")}
                        </Button>
                    </WaitingOverlay>
                </DialogActions>
            </form>
        </Dialog>
    );
};
