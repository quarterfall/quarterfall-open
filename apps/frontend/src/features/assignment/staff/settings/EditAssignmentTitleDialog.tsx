import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from "@mui/material";
import { useUpdateAssignment } from "features/assignment/staff/api/Assignment.data";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TextFieldController } from "ui/form/TextFieldController";
export interface EditAssignmentDialogProps {
    assignment: Assignment;
    open: boolean;
    onClose?: () => void;
}

export function EditAssignmentTitleDialog(props: EditAssignmentDialogProps) {
    const { open, onClose = () => void 0, assignment } = props;
    const { t } = useTranslation();
    const [updateAssignmentMutation] = useUpdateAssignment();
    const { showSuccessToast } = useToast();

    const defaultValues = { title: assignment?.title };
    const {
        control,
        handleSubmit,
        formState: { isValid, isDirty },
    } = useForm({
        mode: "onChange",
        defaultValues,
    });

    const onSubmit = async (input) => {
        await updateAssignmentMutation({
            variables: {
                id: assignment.id,
                input,
            },
        });
        showSuccessToast();
        onClose();
    };
    return (
        <Dialog open={open} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{t("assignment:editTitle")}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2}>
                        <Typography gutterBottom>
                            {t("assignment:editTitleText")}
                        </Typography>
                        <TextFieldController
                            control={control}
                            required
                            autoFocus
                            fullWidth
                            name="title"
                            label={t("assignment:title")}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("cancel")}</Button>
                    <Button
                        type="submit"
                        color="primary"
                        key={`${!isValid || !isDirty}`}
                        disabled={!isValid || !isDirty}
                        onClick={onClose}
                    >
                        {t("continue")}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
