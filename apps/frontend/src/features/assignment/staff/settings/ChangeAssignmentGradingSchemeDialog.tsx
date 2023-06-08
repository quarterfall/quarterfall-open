import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
} from "@mui/material";
import {
    useChangeAssignmentGradingScheme,
    useRecalculateGrades,
} from "features/assignment/staff/api/Assignment.data";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { GradingScheme } from "interface/GradingScheme.interface";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { SelectController } from "ui/form/SelectController";
export interface ChangeAssignmentGradingSchemeDialogProps {
    assignment: Assignment;
    gradingSchemes: GradingScheme[];
    open: boolean;
    onClose?: () => void;
}
export default function ChangeAssignmentGradingSchemeDialog(
    props: ChangeAssignmentGradingSchemeDialogProps
) {
    const { open, onClose, assignment, gradingSchemes } = props;
    const { t } = useTranslation();
    const { showErrorToast, showSuccessToast } = useToast();

    const [selectedSchemeId, setSelectedSchemeId] = useState(
        assignment.gradingSchemes.find((s) => s.isDefault)?.id ||
            assignment.gradingSchemes[0]?.id
    );

    const [changeGradingSchemeMutation] = useChangeAssignmentGradingScheme();
    const [recalculateGradesMutation] = useRecalculateGrades();

    const [recalculateGradesDialogOpen, setRecalculateGradesDialogOpen] =
        useState(false);

    const handleUpdateSelectedGradingScheme = async ({ gradingSchemeId }) => {
        try {
            await changeGradingSchemeMutation({
                variables: {
                    assignmentId: assignment.id,
                    gradingSchemeId,
                },
            });
            showSuccessToast();
        } catch (error) {
            showErrorToast(t("unknownError"));
        }
    };

    const handleRecalculateGrades = async () => {
        try {
            await recalculateGradesMutation({
                variables: {
                    id: assignment.id,
                },
            });
            showSuccessToast();
        } catch (error) {
            showErrorToast(t("unknownError"));
        }
        setRecalculateGradesDialogOpen(false);
    };

    const onSubmit = async ({ gradingSchemeId }) => {
        setSelectedSchemeId(gradingSchemeId);
        if (assignment?.hasSubmissions) {
            setRecalculateGradesDialogOpen(true);
        } else {
            await handleUpdateSelectedGradingScheme({
                gradingSchemeId,
            });
        }
        onClose();
    };

    const {
        handleSubmit,
        control,
        formState: { isValid },
    } = useForm({
        mode: "onChange",
        defaultValues: {
            gradingSchemeId:
                assignment.gradingSchemes.find(
                    (s) => s.name === assignment.gradingSchemeName
                )?.id ||
                assignment.gradingSchemes.find((s) => s.isDefault)?.id ||
                assignment.gradingSchemes[0]?.id,
        },
    });

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>
                        {t("assignment:changeGradingScheme")}
                    </DialogTitle>
                    <DialogContent>
                        <Stack spacing={1} direction="column">
                            <SelectController
                                fullWidth
                                name="gradingSchemeId"
                                variant="outlined"
                                displayEmpty
                                label={t("assignment:gradingSchemeTitle")}
                                control={control}
                            >
                                {gradingSchemes?.map((s, key) => {
                                    return (
                                        <MenuItem key={key} value={s.id}>
                                            {t(s.name)}{" "}
                                            {Boolean(s?.isDefault)
                                                ? `(${t("default")})`
                                                : ""}
                                        </MenuItem>
                                    );
                                })}
                            </SelectController>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose}>{t("cancel")}</Button>
                        <Button
                            color="primary"
                            type="submit"
                            disabled={!isValid}
                        >
                            {assignment?.hasSubmissions
                                ? t("assignment:changeAndRecalculateGrades")
                                : t("save")}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            <ConfirmationDialog
                open={recalculateGradesDialogOpen}
                title={t("assignment:confirmRecalculateGradesTitle")}
                message={t("assignment:confirmRecalculateGradesMessage")}
                onContinue={async () => {
                    await handleUpdateSelectedGradingScheme({
                        gradingSchemeId: selectedSchemeId,
                    });
                    await handleRecalculateGrades();
                }}
                onCancel={() => {
                    setRecalculateGradesDialogOpen(false);
                }}
            />
        </>
    );
}
