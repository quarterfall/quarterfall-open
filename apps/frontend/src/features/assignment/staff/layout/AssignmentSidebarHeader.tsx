import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
    Avatar,
    Box,
    Chip,
    darken,
    IconButton,
    lighten,
    Tooltip,
    Typography,
} from "@mui/material";
import { AssignmentIcon } from "components/icons";
import { ellipsis, Permission } from "core";
import { useUpdateAssignment } from "features/assignment/staff/api/Assignment.data";
import { EditAssignmentTitleDialog } from "features/assignment/staff/settings/EditAssignmentTitleDialog";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";
import { CheckboxController } from "ui/form/CheckboxController";
import { LabeledRatingController } from "ui/form/RatingFieldController";
export interface AssignmentSidebarHeaderProps {
    assignment: Assignment;
}
export function AssignmentSidebarHeader(props: AssignmentSidebarHeaderProps) {
    const { assignment } = props;
    const { t } = useTranslation();
    const { showSuccessToast } = useToast();
    const can = usePermission();
    const module = assignment?.module;
    const course = module?.course;

    const [updateAssignmentMutation] = useUpdateAssignment();
    const [createBlockDialogOpen, setCreateBlockDialogOpen] = useState(false);

    const readOnly = !can(Permission.updateCourse, course);

    const titleMaxLength = 38; // maximum length of the title shown in the top left

    const assignmentTooltipTitle = (() => {
        if (assignment?.isStudyMaterial) {
            return assignment?.isOptional
                ? t("assignment:optionalStudyMaterial")
                : t("assignment:mandatoryStudyMaterial");
        } else {
            return assignment?.isOptional
                ? t("assignment:optionalAssignment")
                : t("assignment:mandatoryAssignment");
        }
    })();

    const onSave = async (input) => {
        await updateAssignmentMutation({
            variables: {
                id: assignment?.id,
                input,
            },
        });
        showSuccessToast();
    };

    const defaultValues = {
        ...assignment,
    };

    const { control, reset } = useAutosaveForm({
        defaultValues,
        onSave,
    });

    const onClose = () => {
        setCreateBlockDialogOpen(false);
    };

    useEffect(() => {
        reset(defaultValues);
    }, [assignment]);

    return (
        <div>
            <form>
                <Box
                    sx={(theme) => ({
                        position: "relative",
                        paddingTop: 2,
                        paddingBottom: 1,
                        backgroundColor:
                            theme.palette.mode === "light"
                                ? darken(theme.palette.background.paper, 0.08)
                                : lighten(theme.palette.background.paper, 0.08),
                    })}
                >
                    {!readOnly && (
                        <Tooltip
                            title={
                                assignment?.visible
                                    ? t("visible")
                                    : t("notVisible")
                            }
                        >
                            <Box
                                sx={{ position: "absolute", right: 5, top: 5 }}
                            >
                                <CheckboxController
                                    control={control}
                                    color="default"
                                    icon={<VisibilityOffIcon />}
                                    checkedIcon={<VisibilityIcon />}
                                    name="visible"
                                    disabled={readOnly}
                                />
                            </Box>
                        </Tooltip>
                    )}
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                    >
                        {assignment?.hasGrading && (
                            <Chip
                                label={t("assignment:hasGrading")}
                                variant="outlined"
                                sx={{
                                    fontSize: (theme) => theme.spacing(1.5),
                                    height: (theme) => theme.spacing(2.5),
                                    paddingRight: 0,
                                    paddingLeft: 0,
                                    marginBottom: 1,
                                    borderColor: "action.disabledBackground",
                                    "& .MuiChip-label": {
                                        paddingRight: 1,
                                        paddingLeft: 1,
                                    },
                                    "& .MuiChip-avatar": {
                                        width: (theme) => theme.spacing(2),
                                        height: (theme) => theme.spacing(2),
                                    },
                                }}
                                data-cy="assignmentSidebarHeaderHasGradingChip"
                            />
                        )}

                        <Tooltip title={assignmentTooltipTitle}>
                            <Avatar
                                sx={{
                                    marginBottom: 1,
                                    color: (theme) =>
                                        theme.palette.getContrastText(
                                            theme.palette.secondary.main
                                        ),
                                    backgroundColor: "secondary.main",
                                }}
                            >
                                <AssignmentIcon assignment={assignment} />
                            </Avatar>
                        </Tooltip>

                        <Typography variant="h5">{t("assignment")}</Typography>
                        <Box
                            sx={{
                                display: "flex",
                                paddingLeft: readOnly
                                    ? 0
                                    : (theme) => theme.spacing(2),
                                marginBottom: (theme) => theme.spacing(1),
                                alignItems: "flex-start",
                                cursor: readOnly ? "default" : "pointer",
                            }}
                        >
                            <Tooltip
                                title={
                                    assignment?.title.length >
                                    titleMaxLength ? (
                                        <Typography>
                                            {assignment?.title}
                                        </Typography>
                                    ) : (
                                        ""
                                    )
                                }
                            >
                                <Typography
                                    variant="subtitle1"
                                    color="textSecondary"
                                    sx={{
                                        textAlign: "center",
                                        paddingLeft: (theme) =>
                                            theme.spacing(0.5),
                                        paddingRight: (theme) =>
                                            theme.spacing(0.5),
                                        "&:hover": {
                                            background: readOnly
                                                ? null
                                                : (theme) =>
                                                      theme.palette.action
                                                          .hover,
                                            borderRadius: (theme) =>
                                                theme.shape.borderRadius,
                                        },
                                    }}
                                    onClick={() => {
                                        if (readOnly) return null;
                                        setCreateBlockDialogOpen(true);
                                    }}
                                    data-cy="assignmentSidebarHeaderTitle"
                                >
                                    {ellipsis(
                                        assignment?.title || "",
                                        titleMaxLength
                                    )}
                                </Typography>
                            </Tooltip>
                            {!readOnly && (
                                <IconButton
                                    size="small"
                                    onClick={() =>
                                        setCreateBlockDialogOpen(true)
                                    }
                                    disabled={readOnly}
                                >
                                    <EditIcon fontSize="inherit" />
                                </IconButton>
                            )}
                        </Box>

                        <LabeledRatingController
                            control={control}
                            name="difficulty"
                            tooltipTitle={(rating) =>
                                t(`assignment:difficultyRating_${rating}`)
                            }
                            disabled={readOnly}
                        />
                    </Box>
                </Box>
            </form>
            <EditAssignmentTitleDialog
                assignment={assignment}
                open={createBlockDialogOpen}
                onClose={onClose}
            />
        </div>
    );
}
