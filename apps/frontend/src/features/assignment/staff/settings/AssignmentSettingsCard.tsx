import SettingsIcon from "@mui/icons-material/Settings";
import { Card, CardContent, CardHeader, Grid } from "@mui/material";
import { Permission } from "core";
import { useUpdateAssignment } from "features/assignment/staff/api/Assignment.data";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ColoredAvatar } from "ui/ColoredAvatar";
import { useAutosaveForm } from "ui/form/Autosave";
import { LabeledRatingController } from "ui/form/RatingFieldController";
import { SwitchController } from "ui/form/SwitchController";
export interface AssignmentSettingsCardProps {
    assignment: Assignment;
}

export function AssignmentSettingsCard(props: AssignmentSettingsCardProps) {
    const { t } = useTranslation();
    const { assignment } = props;
    const { showSuccessToast } = useToast();
    const [updateAssignmentMutation] = useUpdateAssignment();

    const can = usePermission();
    const module = assignment.module;
    const course = module?.course;
    const readOnly = !can(Permission.updateCourse, course);

    // Form for the assignment general settings editor
    const onSave = async (input) => {
        await updateAssignmentMutation({
            variables: {
                id: assignment.id,
                input,
            },
        });
        showSuccessToast();
    };

    const { control, reset } = useAutosaveForm({
        defaultValues: {
            ...assignment,
        },
        onSave,
    });

    useEffect(() => {
        reset({ ...assignment });
    }, [assignment]);

    return (
        <Card sx={{ width: "100%" }}>
            <CardHeader
                title={t("settings")}
                avatar={
                    <ColoredAvatar>
                        <SettingsIcon />
                    </ColoredAvatar>
                }
            />
            <CardContent>
                <Grid container spacing={2} direction="column">
                    {/* Difficulty */}
                    <Grid item xs={12}>
                        <LabeledRatingController
                            legend={t("assignment:difficultyLegend")}
                            ratingLabel={(rating) =>
                                t(`assignment:difficultyRating_${rating}`)
                            }
                            name="difficulty"
                            disabled={readOnly}
                            control={control}
                        />
                    </Grid>

                    {/* Visibility */}

                    <Grid item xs={12}>
                        <SwitchController
                            color="primary"
                            label={t("visible")}
                            name="visible"
                            disabled={readOnly}
                            control={control}
                        />
                    </Grid>

                    {/* Is optional */}

                    <Grid item xs={12}>
                        <SwitchController
                            label={t("assignment:isOptional")}
                            name="isOptional"
                            disabled={readOnly || assignment?.hasGrading}
                            control={control}
                        />
                    </Grid>

                    {/* Force making assignment in block order */}
                    <Grid item xs={12}>
                        <SwitchController
                            color="primary"
                            label={t("assignment:forceBlockOrder")}
                            name="forceBlockOrder"
                            disabled={readOnly}
                            control={control}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
