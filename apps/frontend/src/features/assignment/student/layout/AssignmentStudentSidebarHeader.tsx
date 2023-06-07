import {
    Avatar,
    Box,
    Chip,
    darken,
    lighten,
    Rating,
    Tooltip,
    Typography,
} from "@mui/material";
import { AssignmentIcon } from "components/icons";
import { ellipsis } from "core";
import { Assignment } from "interface/Assignment.interface";
import { useTranslation } from "react-i18next";
export interface AssignmentStudentSidebarHeaderProps {
    assignment: Assignment;
}
export function AssignmentStudentSidebarHeader(
    props: AssignmentStudentSidebarHeaderProps
) {
    const { assignment } = props;
    const { t } = useTranslation();
    const titleMaxLength = 38;

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

    return (
        <div>
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
                minWidth={240}
            >
                <Box display="flex" flexDirection="column" alignItems="center">
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
                            marginBottom: (theme) => theme.spacing(1),
                            alignItems: "flex-start",
                        }}
                    >
                        <Tooltip
                            title={
                                assignment?.title.length > titleMaxLength ? (
                                    <Typography>{assignment?.title}</Typography>
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
                                    paddingX: (theme) => theme.spacing(0.5),
                                }}
                            >
                                {ellipsis(
                                    assignment?.title || "",
                                    titleMaxLength
                                )}
                            </Typography>
                        </Tooltip>
                    </Box>

                    {assignment?.difficulty && (
                        <Rating value={assignment?.difficulty} readOnly />
                    )}
                </Box>
            </Box>
        </div>
    );
}
