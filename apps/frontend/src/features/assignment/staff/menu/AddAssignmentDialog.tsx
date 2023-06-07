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
import { useCreateAssignment } from "features/assignment/staff/api/Assignment.data";
import { Module } from "interface/Module.interface";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { LabeledSwitch } from "ui/form/inputs/LabeledSwitch";
import { TextFieldController } from "ui/form/TextFieldController";
import { useNavigation } from "ui/route/Navigation";
import { WaitingOverlay } from "ui/WaitingOverlay";

export interface AddAssignmentDialogProps {
    module: Module;
    beforeIndex?: number;
    open: boolean;
    onClose?: () => void;
}

export function AddAssignmentDialog(props: AddAssignmentDialogProps) {
    const { open, onClose, module, beforeIndex } = props;
    const { t } = useTranslation();

    const [createAssignmentMutation] = useCreateAssignment();
    const router = useNavigation();
    const [waiting, setWaiting] = useState(false);
    const [hasGrading, setHasGrading] = useState(false);

    const onSubmit = async (input) => {
        setWaiting(true);
        const result = await createAssignmentMutation({
            variables: {
                input,
                moduleId: module.id,
                beforeIndex,
            },
        });
        const assignmentId =
            result && result.data && result.data.createAssignment
                ? result.data.createAssignment.assignments[
                      result.data.createAssignment.assignments.length - 1
                  ].id
                : null;

        if (!assignmentId) {
            throw new Error(
                "Create assignment mutation did not return an assignment id."
            );
        }
        setWaiting(false);
        onClose();
        router.push(`/assignment/${assignmentId}`);
    };
    const defaultValues = {
        title: "",
        assessmentType: hasGrading ? AssessmentType["teacher"] : null,
    };
    // Form for the assignment creation
    const {
        control,
        handleSubmit,
        formState: { isValid },
        reset,
        watch,
    } = useForm({
        mode: "onChange",
        defaultValues,
    });

    useEffect(() => {
        reset({
            title: watch("title"),
            assessmentType: hasGrading ? AssessmentType["teacher"] : null,
        });
    }, [hasGrading]);

    return (
        <Dialog open={open} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{t("assignment:titleAddAssignment")}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} direction="column">
                        <Grid item xs={12}>
                            <Typography>
                                {t("assignment:bodyAddAssignment")}
                            </Typography>
                        </Grid>
                        {/* Assignment title */}
                        <Grid item xs={12}>
                            <TextFieldController
                                autoFocus
                                fullWidth
                                label={t("title")}
                                name="title"
                                control={control}
                                required
                                data-cy="createAssignmentDialogTitle"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <LabeledSwitch
                                label={t("assignment:toggleHasGradingTitle")}
                                labelPlacement="start"
                                labelProps={{ style: { marginLeft: 0 } }}
                                name="hasGrading"
                                checked={hasGrading}
                                onChange={(e) =>
                                    setHasGrading(e.target.checked)
                                }
                                data-cy="createAssignmentDialogSwitch"
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
                            data-cy="createAssignmentDialogSubmit"
                        >
                            {t("continue")}
                        </Button>
                    </WaitingOverlay>
                </DialogActions>
            </form>
        </Dialog>
    );
}
