import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Typography,
} from "@mui/material";
import { Course } from "interface/Course.interface";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TextFieldController } from "ui/form/TextFieldController";
import { WaitingOverlay } from "ui/WaitingOverlay";
import { useCreateModule } from "./api/Module.data";

export interface AddModuleDialogProps {
    course: Course;
    beforeIndex?: number;
    open: boolean;
    onClose?: () => void;
}

export function AddModuleDialog(props: AddModuleDialogProps) {
    const { t } = useTranslation();
    const [waiting, setWaiting] = useState(false);
    const [createModuleMutation] = useCreateModule();

    const { open, onClose, course, beforeIndex } = props;

    // Form for the module creation
    const {
        control,
        handleSubmit,
        formState: { isValid },
    } = useForm({
        mode: "onChange",
    });

    const onSubmit = async (input) => {
        setWaiting(true);
        await createModuleMutation({
            variables: {
                input,
                courseId: course.id,
                beforeIndex,
            },
        });
        setWaiting(false);

        if (onClose) {
            onClose();
        }
    };
    return (
        <Dialog open={open} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>
                    {beforeIndex !== undefined
                        ? t("module:titleInsertModule")
                        : t("module:titleAddModule")}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} direction="column">
                        <Grid item>
                            <Typography>
                                {beforeIndex !== undefined
                                    ? t("module:bodyInsertModule")
                                    : t("module:bodyAddModule")}
                            </Typography>
                        </Grid>
                        {/* Module title input */}
                        <Grid item>
                            <TextFieldController
                                control={control}
                                autoFocus
                                fullWidth
                                label={t("title")}
                                name="title"
                                data-cy="createModuleDialogTitle"
                                required
                            />
                        </Grid>
                        {/* Module description input */}
                        <Grid item>
                            <TextFieldController
                                control={control}
                                fullWidth
                                multiline
                                label={t("description")}
                                name="description"
                                data-cy="createModuleDialogDescription"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("cancel")}</Button>
                    <WaitingOverlay waiting={waiting}>
                        <Button
                            type="submit"
                            color="primary"
                            key={`${!isValid}`}
                            disabled={waiting || !isValid}
                            data-cy="createModuleDialogSubmit"
                        >
                            {t("continue")}
                        </Button>
                    </WaitingOverlay>
                </DialogActions>
            </form>
        </Dialog>
    );
}
