import { Draggable } from "@hello-pangea/dnd";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
    Box,
    Chip,
    IconButton,
    lighten,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import { AssignmentIcon } from "components/icons";
import { Permission } from "core";
import { AssignmentMenu } from "features/assignment/staff/menu/AssignmentMenu";
import { usePermission } from "hooks/usePermission";
import { Assignment } from "interface/Assignment.interface";
import { Course } from "interface/Course.interface";
import { Module } from "interface/Module.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DifficultyRating } from "ui/DifficultyRating";
import { useNavigation } from "ui/route/Navigation";

export interface AssignmentCardProps {
    assignment: Assignment;
    module: Module;
    course: Course;
    index: number;
}

export function AssignmentCard(props: AssignmentCardProps) {
    const { t } = useTranslation();
    const router = useNavigation();
    const [anchorEl, setAnchorEl] = useState(null);
    const can = usePermission();

    const { assignment, module, course, index } = props;

    const blocks = assignment?.blocks || [];
    const canUpdateCourse = can(Permission.updateCourse, course);

    const hasOneQuestion = !assignment?.hasIntroduction && blocks.length === 1;

    const handleClickEdit = () =>
        router.push(
            `/assignment/${assignment.id}${
                hasOneQuestion ? `/questions/${blocks[0].id}` : ""
            }`
        );

    const handleClick = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const elevation = assignment.visible ? 1 : 0;

    const assignmentTooltipTitle = (() => {
        if (assignment.isStudyMaterial) {
            return assignment.isOptional
                ? t("assignment:optionalStudyMaterial")
                : t("assignment:mandatoryStudyMaterial");
        } else {
            return assignment.isOptional
                ? t("assignment:optionalAssignment")
                : t("assignment:mandatoryAssignment");
        }
    })();

    return (
        <>
            <Draggable
                draggableId={assignment.id}
                index={index}
                isDragDisabled={!canUpdateCourse}
            >
                {(provided, snapshot) => {
                    const style = {
                        cursor: "pointer",
                        ...provided.draggableProps.style,
                    };
                    return (
                        <Paper
                            elevation={snapshot.isDragging ? 10 : elevation}
                            sx={(theme) => ({
                                marginBottom: 0.75,
                                ...(!assignment.visible && {
                                    border: "2px dotted",
                                    color: "action.disabled",
                                }),
                                ...(theme.palette.mode === "dark" && {
                                    backgroundColor: (theme) =>
                                        lighten(
                                            theme.palette.background.paper,
                                            0.08
                                        ),
                                }),
                            })}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            onClick={handleClickEdit}
                            style={style}
                        >
                            <Box
                                sx={(theme) => ({
                                    width: "100%",
                                    height: "100%",
                                    "&:hover": {
                                        backgroundColor:
                                            theme.palette.action.hover,
                                        borderRadius: `${theme.shape.borderRadius}px `,
                                    },
                                })}
                            >
                                <Stack padding={1}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            alignItems: "center",
                                            ...(assignment.visible && {
                                                color: "secondary.main",
                                            }),
                                        }}
                                    >
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                        >
                                            <Tooltip
                                                title={assignmentTooltipTitle}
                                            >
                                                <Box sx={{ height: 24 }}>
                                                    <AssignmentIcon
                                                        assignment={assignment}
                                                    />
                                                </Box>
                                            </Tooltip>

                                            {assignment?.hasGrading && (
                                                <Chip
                                                    label={t(
                                                        "assignment:hasGrading"
                                                    )}
                                                    variant="outlined"
                                                    sx={{
                                                        fontSize: (theme) =>
                                                            theme.spacing(1.5),
                                                        height: (theme) =>
                                                            theme.spacing(2.5),
                                                        paddingRight: 0,
                                                        paddingLeft: 0,
                                                        "& .MuiChip-label": {
                                                            paddingRight: 1,
                                                            paddingLeft: 1,
                                                        },
                                                        "& .MuiChip-avatar": {
                                                            width: (theme) =>
                                                                theme.spacing(
                                                                    2
                                                                ),
                                                            height: (theme) =>
                                                                theme.spacing(
                                                                    2
                                                                ),
                                                        },
                                                    }}
                                                />
                                            )}
                                        </Stack>

                                        <Box style={{ flexGrow: 1 }} />

                                        {Boolean(assignment.difficulty) && (
                                            <DifficultyRating
                                                difficulty={
                                                    assignment.difficulty
                                                }
                                            />
                                        )}

                                        {canUpdateCourse && (
                                            <Tooltip title={t("showMore")}>
                                                <IconButton
                                                    onClick={handleClick}
                                                    size="small"
                                                >
                                                    <MoreVertIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>

                                    <Typography style={{ paddingTop: 8 }}>
                                        {assignment?.title}
                                    </Typography>
                                </Stack>
                            </Box>
                        </Paper>
                    );
                }}
            </Draggable>
            {canUpdateCourse && (
                <AssignmentMenu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    assignment={assignment}
                    module={module}
                    course={course}
                    index={index}
                />
            )}
        </>
    );
}
