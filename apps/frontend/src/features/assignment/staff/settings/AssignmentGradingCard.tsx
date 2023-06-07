import EditIcon from "@mui/icons-material/Edit";
import ChevronDownIcon from "@mui/icons-material/KeyboardArrowDown";
import GradingIcon from "@mui/icons-material/Spellcheck";
import {
    Alert,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Stack,
    Typography,
} from "@mui/material";
import { ActionType, AssessmentType, Permission } from "core";
import { useUpdateAssignment } from "features/assignment/staff/api/Assignment.data";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { ColoredAvatar } from "ui/ColoredAvatar";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { LabeledSwitch } from "ui/form/inputs/LabeledSwitch";
import ChangeAssignmentGradingSchemeDialog from "./ChangeAssignmentGradingSchemeDialog";
import UpdateGradingSchemeDialog from "./UpdateGradingSchemeDialog";

export interface AssignmentGradingCardProps {
    assignment: Assignment;
}

export function AssignmentGradingCard(props: AssignmentGradingCardProps) {
    const { assignment } = props;
    const { t } = useTranslation();
    const { showSuccessToast } = useToast();
    const can = usePermission();

    const module = assignment.module;
    const course = module?.course;

    const readOnly = !can(Permission.updateCourse, course);

    const [hasGrading, setHasGrading] = useState(assignment?.hasGrading);

    const [updateAssignmentMutation] = useUpdateAssignment();

    const [enableGradingDialogOpen, setEnableGradingDialogOpen] =
        useState(false);
    const [changeGradingSchemeDialogOpen, setChangeGradingSchemeDialogOpen] =
        useState(false);
    const [updateGradingSchemeDialogOpen, setUpdateGradingSchemeDialogOpen] =
        useState(false);

    const onContinueChangeGrading = async () => {
        setHasGrading(!hasGrading);
        setEnableGradingDialogOpen(false);
        await updateAssignmentMutation({
            variables: {
                id: assignment?.id,
                input: {
                    assessmentType: hasGrading
                        ? null
                        : AssessmentType["teacher"],
                },
            },
        });
        showSuccessToast();
    };

    const onGradingChange = async (
        e: ChangeEvent<HTMLInputElement>,
        checked: boolean
    ) => {
        if (assignment?.hasSubmissions) {
            return;
        }
        const scoringActions = assignment?.blocks.flatMap((b) =>
            b.actions.filter((a) => a.type === ActionType.Scoring)
        );
        if (assignment?.hasGrading && scoringActions?.length) {
            setEnableGradingDialogOpen(true);
            return;
        }
        setHasGrading(checked);
        await updateAssignmentMutation({
            variables: {
                id: assignment?.id,
                input: {
                    assessmentType: hasGrading
                        ? null
                        : AssessmentType["teacher"],
                },
            },
        });
        showSuccessToast();
    };

    return (
        <Card>
            <CardHeader
                title={t("assignment:gradingSettings")}
                avatar={
                    <ColoredAvatar>
                        <GradingIcon />
                    </ColoredAvatar>
                }
            />
            <CardContent>
                <Stack spacing={1}>
                    {assignment?.hasSubmissions && (
                        <Alert severity="warning">
                            {t("assignment:hasSubmissionsWarning")}
                        </Alert>
                    )}
                    <LabeledSwitch
                        label={t("assignment:toggleHasGradingTitle")}
                        labelPlacement="end"
                        name="hasGrading"
                        checked={hasGrading}
                        disabled={readOnly || assignment?.hasSubmissions}
                        onChange={onGradingChange}
                    />
                    {assignment?.hasGrading && (
                        <Stack spacing={1}>
                            <Stack
                                spacing={1}
                                direction="row"
                                alignItems="center"
                            >
                                <Typography variant="h6">
                                    {t("assignment:gradingSchemeTitle")}:
                                </Typography>
                                <Typography variant="subtitle1">
                                    {assignment?.gradingSchemeName
                                        ? t(assignment?.gradingSchemeName)
                                        : t(
                                              assignment?.gradingSchemes[0]
                                                  ?.name
                                          )}
                                </Typography>
                            </Stack>
                            <Typography variant="body2">
                                {assignment?.gradingSchemeDescription
                                    ? t(assignment?.gradingSchemeDescription)
                                    : t(
                                          assignment?.gradingSchemes[0]
                                              ?.description
                                      )}
                            </Typography>
                        </Stack>
                    )}
                </Stack>
            </CardContent>
            {assignment?.hasGrading && (
                <CardActions>
                    <Align right>
                        <Stack spacing={1} direction="row">
                            <Button
                                onClick={() => {
                                    setChangeGradingSchemeDialogOpen(true);
                                }}
                                endIcon={<ChevronDownIcon />}
                            >
                                {t("assignment:changeGradingScheme")}
                            </Button>

                            <Button
                                onClick={() => {
                                    setUpdateGradingSchemeDialogOpen(true);
                                }}
                                endIcon={<EditIcon />}
                            >
                                {t("assignment:editGradingScheme")}
                            </Button>
                        </Stack>
                    </Align>
                </CardActions>
            )}
            <ConfirmationDialog
                open={enableGradingDialogOpen}
                title={t("assignment:hasScoringActionsWarningTitle")}
                message={t("assignment:hasScoringActionsWarningMessage")}
                onCancel={() => {
                    setEnableGradingDialogOpen(false);
                }}
                onContinue={onContinueChangeGrading}
            />
            <ChangeAssignmentGradingSchemeDialog
                open={changeGradingSchemeDialogOpen}
                onClose={() => {
                    setChangeGradingSchemeDialogOpen(false);
                }}
                assignment={assignment}
                gradingSchemes={assignment?.gradingSchemes}
            />
            <UpdateGradingSchemeDialog
                open={updateGradingSchemeDialogOpen}
                onClose={() => {
                    setUpdateGradingSchemeDialogOpen(false);
                }}
                assignment={assignment}
            />
        </Card>
    );
}
