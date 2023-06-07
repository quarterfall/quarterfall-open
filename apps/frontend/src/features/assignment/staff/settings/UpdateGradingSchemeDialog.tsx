import MoveDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoveUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
} from "@mui/material";
import { ProgrammingLanguage } from "core";
import {
    useRecalculateGrades,
    useUpdateAssignment,
} from "features/assignment/staff/api/Assignment.data";
import { TestGradingForm } from "features/organization/gradingSchemes/TestGradingForm";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { CodeEditorController } from "ui/form/CodeEditorController";
import { TextFieldController } from "ui/form/TextFieldController";
export interface UpdateGradingSchemeDialogProps {
    assignment: Assignment;
    open: boolean;
    onClose?: () => void;
}
export default function UpdateGradingSchemeDialog(
    props: UpdateGradingSchemeDialogProps
) {
    const { open, onClose, assignment } = props;
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);
    const [recalculateGradesDialogOpen, setRecalculateGradesDialogOpen] =
        useState(false);
    const { showErrorToast, showSuccessToast } = useToast();

    const defaultValues = {
        gradingSchemeName:
            t(assignment?.gradingSchemeName) ||
            t(assignment?.gradingSchemes[0]?.name),
        gradingSchemeDescription:
            t(assignment?.gradingSchemeDescription) ||
            t(assignment?.gradingSchemes[0]?.description),
        gradingSchemeCode:
            assignment.gradingSchemeCode || assignment?.gradingSchemes[0]?.code,
    };
    const [schemeInput, setSchemeInput] = useState(defaultValues);

    const [updateGradingSchemeMutation] = useUpdateAssignment();
    const [recalculateGradesMutation] = useRecalculateGrades();

    const handleUpdateScheme = async (input?) => {
        await updateGradingSchemeMutation({
            variables: {
                id: assignment.id,
                input: input || schemeInput,
            },
        });
        showSuccessToast();
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

    const onSubmit = async (input) => {
        onClose();
        if (assignment?.hasSubmissions) {
            setSchemeInput({ ...schemeInput, ...input });
            setRecalculateGradesDialogOpen(true);
        } else {
            await handleUpdateScheme(input);
        }
    };

    const {
        control,
        watch,
        handleSubmit,
        formState: { isValid },
        reset,
    } = useForm({
        mode: "onChange",
        defaultValues,
    });

    useEffect(() => {
        reset(defaultValues);
    }, [assignment]);

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>
                        {t("assignment:updateGradingSchemeTitle")}
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} direction="column">
                            <Grid item xs={12}>
                                <TextFieldController
                                    fullWidth
                                    control={control}
                                    name="gradingSchemeName"
                                    label={t("assignment:name")}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextFieldController
                                    fullWidth
                                    control={control}
                                    name="gradingSchemeDescription"
                                    multiline
                                    label={t("description")}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <CodeEditorController
                                    control={control}
                                    name={"gradingSchemeCode"}
                                    label={t("code")}
                                    required
                                    language={ProgrammingLanguage.javascript}
                                    controllerProps={
                                        {
                                            rules: {
                                                validate: {
                                                    includesScore: (v) =>
                                                        v.includes("score") ||
                                                        t(
                                                            "validationShouldIncludeScore"
                                                        ),
                                                    includesReturn: (v) =>
                                                        v.includes("return") ||
                                                        t(
                                                            "validationShouldIncludeReturn"
                                                        ),
                                                },
                                            },
                                        } as any
                                    }
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Align left>
                                    <Button
                                        onClick={() => setExpanded(!expanded)}
                                        endIcon={
                                            expanded ? (
                                                <MoveUpIcon />
                                            ) : (
                                                <MoveDownIcon />
                                            )
                                        }
                                        disabled={!isValid}
                                    >
                                        {expanded
                                            ? t("hideTest")
                                            : t("showTest")}
                                    </Button>
                                </Align>
                            </Grid>
                            {expanded && (
                                <Grid item xs={12}>
                                    <TestGradingForm
                                        gradingScheme={{
                                            code: watch("gradingSchemeCode"),
                                        }}
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose}>{t("cancel")}</Button>
                        <Button
                            color="primary"
                            disabled={!isValid}
                            type="submit"
                        >
                            {t("save")}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            <ConfirmationDialog
                open={recalculateGradesDialogOpen}
                title={t("assignment:confirmRecalculateGradesTitle")}
                message={t("assignment:confirmRecalculateGradesMessage")}
                onContinue={async () => {
                    await handleUpdateScheme();
                    await handleRecalculateGrades();
                }}
                onCancel={() => {
                    setRecalculateGradesDialogOpen(false);
                }}
            />
        </>
    );
}
