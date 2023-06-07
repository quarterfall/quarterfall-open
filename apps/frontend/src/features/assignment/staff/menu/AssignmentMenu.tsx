import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MergeIcon from "@mui/icons-material/MergeType";
import AnalyticsIcon from "@mui/icons-material/PieChart";
import SearchIcon from "@mui/icons-material/Search";
import {
    Checkbox,
    Divider,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    MenuProps,
} from "@mui/material";
import { Permission } from "core";
import {
    useCopyAssignment,
    useUpdateAssignment,
} from "features/assignment/staff/api/Assignment.data";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { Course } from "interface/Course.interface";
import { Module } from "interface/Module.interface";
import CopyIcon from "mdi-material-ui/ContentCopy";
import DuplicateIcon from "mdi-material-ui/ContentDuplicate";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { WaitingDialog } from "ui/dialog/WaitingDialog";
import { useNavigation } from "ui/route/Navigation";
import { AddAssignmentDialog } from "./AddAssignmentDialog";
import { CopyAssignmentDialog } from "./CopyAssignmentDialog";
import { DeleteAssignmentDialog } from "./DeleteAssignmentDialog";
import { MergeAssignmentDialog } from "./MergeAssignmentDialog";

export interface AssignmentMenuProps extends MenuProps {
    assignment: Assignment;
    module: Module;
    course: Course;
    assignmentPage?: boolean;
    index: number;
}

export function AssignmentMenu(props: AssignmentMenuProps) {
    const {
        assignment,
        module,
        course,
        index,
        assignmentPage = false,
        onClose,
        ...rest
    } = props;
    const { t } = useTranslation();
    const router = useNavigation();
    const [deleteAssignmentDialogOpen, setDeleteAssignmentDialogOpen] =
        useState(false);
    const [copyAssignmentDialogOpen, setCopyAssignmentDialogOpen] =
        useState(false);
    const [insertAssignmentDialogOpen, setInsertAssignmentDialogOpen] =
        useState(false);
    const [mergeAssignmentDialogOpen, setMergeAssignmentDialogOpen] =
        useState(false);
    const [duplicatingAssignment, setDuplicatingAssignment] = useState(false);
    const [duplicateAssignmentMutation] = useCopyAssignment();
    const [updateAssignmentMutation] = useUpdateAssignment();
    const { showSuccessToast } = useToast();
    const can = usePermission();

    const closeMenu = () => {
        if (onClose) {
            onClose({}, "backdropClick");
        }
    };

    const handleClickEdit = () => router.push(`/assignment/${assignment.id}`);

    const handleClickAnalytics = () =>
        router.push(`/assignment/${assignment.id}/analytics`);

    const handleClickInsert = () => {
        setInsertAssignmentDialogOpen(true);
        closeMenu();
    };

    const handleClickDuplicate = async () => {
        closeMenu();
        setDuplicatingAssignment(true);
        await duplicateAssignmentMutation({
            variables: {
                id: assignment.id,
            },
        });
        setDuplicatingAssignment(false);
        showSuccessToast(t("assignment:duplicatedConfirmation"));
    };

    const handleClickCopy = () => {
        setCopyAssignmentDialogOpen(true);
        closeMenu();
    };

    const handleClickMerge = () => {
        setMergeAssignmentDialogOpen(true);
        closeMenu();
    };

    const handleClickDelete = () => {
        setDeleteAssignmentDialogOpen(true);
        closeMenu();
    };

    const handleClickToggleVisible = async () => {
        if (onClose) {
            onClose({}, "backdropClick");
        }
        return updateAssignmentMutation({
            variables: {
                id: assignment.id,
                input: {
                    visible: !assignment.visible,
                },
            },
        });
    };

    const canUpdateCourse = can(Permission.updateCourse, course);

    return (
        <>
            <Menu id="assignment-menu" {...rest} onClose={onClose}>
                <MenuItem
                    onClick={handleClickToggleVisible}
                    disabled={!canUpdateCourse}
                >
                    <ListItemIcon>
                        <Checkbox
                            color="primary"
                            sx={{
                                padding: 0,
                            }}
                            checked={assignment.visible}
                            disableRipple
                        />
                    </ListItemIcon>
                    <ListItemText primary={t("visible")} />
                </MenuItem>

                {!assignmentPage && [
                    <MenuItem key="menuitem_edit" onClick={handleClickEdit}>
                        <ListItemIcon>
                            {canUpdateCourse ? <EditIcon /> : <SearchIcon />}
                        </ListItemIcon>
                        <ListItemText
                            primary={canUpdateCourse ? t("edit") : t("view")}
                        />
                    </MenuItem>,
                ]}

                <Divider />
                {can(Permission.readSubmission, course) && (
                    <MenuItem onClick={handleClickAnalytics}>
                        <ListItemIcon>
                            <AnalyticsIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("analytics")} />
                    </MenuItem>
                )}

                {!assignmentPage && canUpdateCourse && (
                    <MenuItem onClick={handleClickInsert}>
                        <ListItemIcon>
                            <AddIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("assignment:insert")} />
                    </MenuItem>
                )}
                {!assignmentPage && canUpdateCourse && (
                    <MenuItem onClick={handleClickDuplicate}>
                        <ListItemIcon>
                            <DuplicateIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("duplicate")} />
                    </MenuItem>
                )}
                {!assignmentPage && canUpdateCourse && (
                    <MenuItem onClick={handleClickCopy}>
                        <ListItemIcon>
                            <CopyIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("copyTo")} />
                    </MenuItem>
                )}
                {!assignmentPage && canUpdateCourse && (
                    <MenuItem onClick={handleClickMerge} disabled={index === 0}>
                        <ListItemIcon>
                            <MergeIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("mergeIntoPrevious")} />
                    </MenuItem>
                )}
                {!assignmentPage && canUpdateCourse && (
                    <MenuItem onClick={handleClickDelete}>
                        <ListItemIcon
                            sx={{
                                color: "error.main",
                            }}
                        >
                            <DeleteIcon />
                        </ListItemIcon>
                        <ListItemText
                            sx={{
                                color: "error.main",
                            }}
                            primary={t("delete")}
                        />
                    </MenuItem>
                )}
            </Menu>
            {/* Insert assignment dialog */}
            <AddAssignmentDialog
                module={module}
                beforeIndex={index}
                open={insertAssignmentDialogOpen}
                onClose={() => setInsertAssignmentDialogOpen(false)}
            />
            {/* Copy assignment dialog */}
            <CopyAssignmentDialog
                assignment={assignment}
                module={module}
                course={course}
                open={copyAssignmentDialogOpen}
                onClose={() => setCopyAssignmentDialogOpen(false)}
            />
            {/* Delete assignment confirmation dialog */}
            <DeleteAssignmentDialog
                assignment={assignment}
                open={deleteAssignmentDialogOpen}
                onClose={() => setDeleteAssignmentDialogOpen(false)}
            />
            {/* Merge assignment confirmation dialog */}
            <MergeAssignmentDialog
                assignment={assignment}
                open={mergeAssignmentDialogOpen}
                onClose={() => setMergeAssignmentDialogOpen(false)}
            />
            <WaitingDialog
                open={duplicatingAssignment}
                message={t("assignment:duplicatingAssignmentMessage")}
            />
        </>
    );
}
