import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Typography,
} from "@mui/material";
import { AssessmentType } from "core";
import { useUpdateAssignment } from "features/assignment/staff/api/Assignment.data";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
export interface EnableAssignmentGradingDialogProps {
    assignment: Assignment;
    open: boolean;
    onClose?: () => void;
}

export const EnableAssignmentGradingDialog = (
    props: EnableAssignmentGradingDialogProps
) => {
    const { open, onClose, assignment } = props;
    const [updateAssignmentMutation] = useUpdateAssignment();
    const { showSuccessToast } = useToast();
    const { t } = useTranslation();

    const onSubmit = async (input) => {
        await updateAssignmentMutation({
            variables: {
                id: assignment.id,
                input,
            },
        });
        onClose();
        showSuccessToast();
    };

    const {
        control,
        handleSubmit,
        formState: { isValid },
    } = useForm({
        mode: "onChange",
        defaultValues: {
            assessmentType: AssessmentType["teacher"],
        },
    });

    return (
        <Dialog open={open} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{t("assignment:enableGradingTitle")}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} direction="column">
                        <Grid item>
                            <Typography>
                                {t("assignment:enableGradingText")}
                            </Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("cancel")}</Button>
                    <Button color="primary" type="submit" disabled={!isValid}>
                        {t("continue")}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
