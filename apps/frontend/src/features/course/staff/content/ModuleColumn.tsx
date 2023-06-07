import { Draggable, Droppable } from "@hello-pangea/dnd";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import MergeIcon from "@mui/icons-material/MergeType";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SettingsIcon from "@mui/icons-material/Settings";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardHeader,
    Checkbox,
    darken,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Typography,
} from "@mui/material";
import { Permission } from "core";
import { format } from "date-fns";
import { AddAssignmentDialog } from "features/assignment/staff/menu/AddAssignmentDialog";
import { ImportAssignmentDialog } from "features/assignment/staff/menu/ImportAssignmentDialog";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Course } from "interface/Course.interface";
import { Module } from "interface/Module.interface";
import CopyIcon from "mdi-material-ui/ContentCopy";
import DuplicateIcon from "mdi-material-ui/ContentDuplicate";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { WaitingDialog } from "ui/dialog/WaitingDialog";
import { useDateLocale } from "ui/hooks/DateLocale";
import { useNavigation } from "ui/route/Navigation";
import { AddModuleDialog } from "./AddModuleDialog";
import { useCopyModule, useUpdateModule } from "./api/Module.data";
import { AssignmentCard } from "./AssignmentCard";
import { CopyModuleDialog } from "./CopyModuleDialog";
import { DeleteModuleDialog } from "./DeleteModuleDialog";
import { MergeModuleDialog } from "./MergeModuleDialog";

export interface ModuleColumnProps {
    course: Course;
    module: Module;
    index: number;
    loading?: boolean;
}

export function ModuleColumn(props: ModuleColumnProps) {
    const { module, course, index } = props;
    const router = useNavigation();
    const { t } = useTranslation();

    const can = usePermission();
    const { showSuccessToast } = useToast();
    const { locale } = useDateLocale();

    const [anchorEl, setAnchorEl] = useState(null);
    const [createAssignmentDialogOpen, setCreateAssignmentDialogOpen] =
        useState(false);
    const [copyModuleDialogOpen, setCopyModuleDialogOpen] = useState(false);
    const [importAssignmentDialogOpen, setImportAssignmentDialogOpen] =
        useState(false);
    const [insertModuleDialogOpen, setInsertModuleDialogOpen] = useState(false);
    const [deleteModuleDialogOpen, setDeleteModuleDialogOpen] = useState(false);
    const [mergeModuleDialogOpen, setMergeModuleDialogOpen] = useState(false);
    const [duplicatingModule, setDuplicatingModule] = useState(false);

    const [copyModuleMutation] = useCopyModule();
    const [updateModuleMutation] = useUpdateModule();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleClickEditSettings = () =>
        router.push(`/module/${module.id}/settings`);

    const handleClickDelete = () => {
        setDeleteModuleDialogOpen(true);
        setAnchorEl(null);
    };

    const handleClickDuplicate = async () => {
        setAnchorEl(null);
        setDuplicatingModule(true);
        await copyModuleMutation({
            variables: {
                id: module.id,
            },
        });
        setDuplicatingModule(false);
        showSuccessToast(t("module:moduleDuplicated"));
    };

    const handleClickCopy = () => {
        setCopyModuleDialogOpen(true);
        setAnchorEl(null);
    };

    const handleClickImportAssignment = () => {
        setImportAssignmentDialogOpen(true);
        setAnchorEl(null);
    };
    const handleClickMerge = () => {
        setMergeModuleDialogOpen(true);
        setAnchorEl(null);
    };

    const handleClickInsert = () => {
        setInsertModuleDialogOpen(true);
        setAnchorEl(null);
    };

    const handleClickToggleVisible = async () => {
        setAnchorEl(null);
        return updateModuleMutation({
            variables: {
                id: module.id,
                input: {
                    visible: !module.visible,
                },
            },
        });
    };

    let moduleDates: string;
    if (module.startDate && !module.endDate) {
        moduleDates = t("startsOn", {
            date: format(new Date(module.startDate), "PP", { locale }),
        });
    } else if (!module.startDate && module.endDate) {
        moduleDates = t("endsOn", {
            date: format(new Date(module.endDate), "PP", { locale }),
        });
    } else if (module.startDate && module.endDate) {
        moduleDates = t("startsEndsOn", {
            startDate: format(new Date(module.startDate), "PP", { locale }),
            endDate: format(new Date(module.endDate), "PP", { locale }),
        });
    }

    const canUpdateCourse = can(Permission.updateCourse, course);

    return (
        <Box>
            <Draggable
                draggableId={module.id}
                index={index}
                isDragDisabled={!canUpdateCourse}
            >
                {(providedColumn) => (
                    <>
                        <Card
                            sx={(theme) => ({
                                marginRight: 1,
                                maxHeight: "100%",
                                width: "300px",
                                minWidth: "300px",
                                display: "flex",
                                flexDirection: "column",
                                ...(theme.palette.mode === "light" && {
                                    backgroundColor: darken(
                                        theme.palette.background.paper,
                                        0.015
                                    ),
                                }),
                            })}
                            {...providedColumn.draggableProps}
                            ref={providedColumn.innerRef}
                        >
                            <Box>
                                <CardHeader
                                    sx={{ padding: 1 }}
                                    title={
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                ...(!module.visible && {
                                                    color: "text.disabled",
                                                }),
                                            }}
                                            data-cy={`moduleColumnHeader_${module.title}`}
                                        >
                                            {module.title}
                                        </Typography>
                                    }
                                    subheader={
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                ...(!module.visible && {
                                                    color: "text.disabled",
                                                }),
                                            }}
                                        >
                                            {!module.visible
                                                ? t("notVisible")
                                                : moduleDates}
                                        </Typography>
                                    }
                                    action={
                                        canUpdateCourse && (
                                            <IconButton
                                                aria-label="settings"
                                                onClick={handleClick}
                                                data-cy={`moduleColumnButton_${module.title}`}
                                                size="large"
                                                sx={{ marginRight: "3px" }}
                                            >
                                                <MoreVertIcon />
                                            </IconButton>
                                        )
                                    }
                                    {...providedColumn.dragHandleProps}
                                />
                            </Box>

                            <Droppable droppableId={module.id} type="task">
                                {(provided, snapshot) => (
                                    <>
                                        <Box
                                            ref={provided.innerRef}
                                            sx={{
                                                overflow: "auto",
                                                display: "flex",
                                                flexDirection: "column",
                                            }}
                                            {...provided.droppableProps}
                                        >
                                            <Box
                                                sx={{
                                                    overflowY: "auto",
                                                    overflowX: "hidden",
                                                    paddingLeft: 0.5,
                                                    paddingRight: 0.5,
                                                    minHeight: "50px",
                                                }}
                                            >
                                                {module.assignments.map(
                                                    (assignment, ind) => (
                                                        <AssignmentCard
                                                            key={assignment.id}
                                                            course={course}
                                                            assignment={
                                                                assignment
                                                            }
                                                            module={module}
                                                            index={ind}
                                                        />
                                                    )
                                                )}
                                                {provided.placeholder}
                                            </Box>
                                            {canUpdateCourse && (
                                                <Box>
                                                    <CardActions
                                                        ref={provided.innerRef}
                                                        sx={{ padding: 0.5 }}
                                                        {...provided.droppableProps}
                                                    >
                                                        <Button
                                                            sx={{
                                                                width: "100%",
                                                            }}
                                                            startIcon={
                                                                <AddIcon />
                                                            }
                                                            onClick={() =>
                                                                setCreateAssignmentDialogOpen(
                                                                    true
                                                                )
                                                            }
                                                            data-cy="createAssignmentButton"
                                                        >
                                                            {t(
                                                                "assignment:add"
                                                            )}
                                                        </Button>
                                                    </CardActions>
                                                </Box>
                                            )}
                                        </Box>
                                    </>
                                )}
                            </Droppable>
                        </Card>
                        {canUpdateCourse && (
                            <Menu
                                id="module-menu"
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={handleClickEditSettings}>
                                    <ListItemIcon>
                                        <SettingsIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={t("settings")} />
                                </MenuItem>

                                <MenuItem onClick={handleClickToggleVisible}>
                                    <ListItemIcon>
                                        <Checkbox
                                            color="primary"
                                            style={{ padding: 0 }}
                                            checked={module.visible}
                                        />
                                    </ListItemIcon>
                                    <ListItemText primary={t("visible")} />
                                </MenuItem>

                                <Divider key="divider_assessment_before" />

                                <MenuItem onClick={handleClickInsert}>
                                    <ListItemIcon>
                                        <AddIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={t("module:insert")}
                                    />
                                </MenuItem>
                                <MenuItem
                                    onClick={handleClickDuplicate}
                                    data-cy={`copyModuleButton_${module.title}`}
                                >
                                    <ListItemIcon>
                                        <DuplicateIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={t("duplicate")} />
                                </MenuItem>
                                <MenuItem onClick={handleClickCopy}>
                                    <ListItemIcon>
                                        <CopyIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={t("copyTo")} />
                                </MenuItem>
                                <MenuItem onClick={handleClickImportAssignment}>
                                    <ListItemIcon>
                                        <ImportExportIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={t(
                                            "assignment:importAssignment"
                                        )}
                                    />
                                </MenuItem>
                                <MenuItem
                                    onClick={handleClickMerge}
                                    disabled={index === 0}
                                    data-cy={`mergeModuleButton_${module.title}`}
                                >
                                    <ListItemIcon>
                                        <MergeIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={t("mergeIntoPrevious")}
                                    />
                                </MenuItem>
                                <MenuItem
                                    onClick={handleClickDelete}
                                    data-cy={`deleteModuleButton_${module.title}`}
                                >
                                    <ListItemIcon sx={{ color: "error.main" }}>
                                        <DeleteIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        sx={{ color: "error.main" }}
                                        primary={t("delete")}
                                    />
                                </MenuItem>
                            </Menu>
                        )}

                        <AddAssignmentDialog
                            module={module}
                            open={createAssignmentDialogOpen}
                            onClose={() => setCreateAssignmentDialogOpen(false)}
                        />

                        <ImportAssignmentDialog
                            module={module}
                            open={importAssignmentDialogOpen}
                            onClose={() => {
                                setImportAssignmentDialogOpen(false),
                                    "backdropClick";
                            }}
                        />

                        <AddModuleDialog
                            course={course}
                            beforeIndex={index}
                            open={insertModuleDialogOpen}
                            onClose={() => setInsertModuleDialogOpen(false)}
                        />

                        <CopyModuleDialog
                            course={course}
                            module={module}
                            open={copyModuleDialogOpen}
                            onClose={() => setCopyModuleDialogOpen(false)}
                        />

                        {/* Merge module confirmation dialog */}
                        <MergeModuleDialog
                            module={module}
                            open={mergeModuleDialogOpen}
                            onClose={() => setMergeModuleDialogOpen(false)}
                        />
                        {/* Delete module confirmation dialog */}
                        <DeleteModuleDialog
                            module={module}
                            open={deleteModuleDialogOpen}
                            onClose={() => setDeleteModuleDialogOpen(false)}
                        />
                        <WaitingDialog
                            open={duplicatingModule}
                            message={t("module:duplicatingModuleMessage")}
                        />
                    </>
                )}
            </Draggable>
        </Box>
    );
}
