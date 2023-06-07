import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
    Typography,
} from "@mui/material";
import { useAuthContext } from "context/AuthProvider";
import { Permission } from "core";
import { useCopyAssignment } from "features/assignment/staff/api/Assignment.data";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { Course } from "interface/Course.interface";
import { Module } from "interface/Module.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LabeledSelect } from "ui/form/inputs/LabeledSelect";
import { WaitingOverlay } from "ui/WaitingOverlay";

export interface CopyAssignmentDialogProps {
    assignment: Assignment;
    module: Module;
    course: Course;
    open: boolean;
    onClose?: () => void;
}

interface ModuleSelection {
    course: Course | null;
    module: Module | null;
}

export function CopyAssignmentDialog(props: CopyAssignmentDialogProps) {
    const [copyAssignmentMutation] = useCopyAssignment();
    const { me } = useAuthContext();
    const { showSuccessToast } = useToast();
    const [copying, setCopying] = useState(false);
    const { t } = useTranslation();
    const can = usePermission();
    const { open, onClose, assignment } = props;

    const openCourses = (me?.courses || []).filter(
        (c) => can(Permission.updateCourse, c) && !c.archived
    );

    // helper function for determining the default course
    const defaultCourse = () => {
        if (
            can(Permission.updateCourse, props?.course) &&
            !props?.course.archived!
        ) {
            return props?.course;
        }
        return openCourses.length > 0 ? openCourses[0] : null;
    };

    // helper function for determining the default module
    const defaultModule = () => {
        const c = defaultCourse();
        return c && c.modules && c.modules.length > 0 ? c.modules[0] : null;
    };

    const [selection, setSelection] = useState<ModuleSelection>({
        course: defaultCourse(),
        module: defaultModule(),
    });

    const handleChangeCourse = (event) => {
        // find the course and choose the first module by default
        const course =
            openCourses.find((c) => c.id === event.target.value) || null;
        const module =
            course && course.modules && course.modules.length > 0
                ? course.modules[0]
                : null;
        setSelection({ course, module });
    };

    const handleChangeModule = (event) => {
        const course = selection.course;
        if (!course) {
            // there is no course, so we cannot find the selected module (should never happen)
            return;
        }
        const module =
            (course.modules || []).find((m) => m.id === event.target.value) ||
            null;
        setSelection({ course, module });
    };

    const handleSubmit = async () => {
        if (!selection.module) {
            return;
        }
        setCopying(true);
        await copyAssignmentMutation({
            variables: {
                id: assignment.id,
                moduleId: selection.module.id,
            },
        });
        setCopying(false);
        showSuccessToast(t("assignment:copiedConfirmation"));
        if (onClose) {
            onClose();
        }
    };

    const onEnter = () => {
        setSelection({
            course: defaultCourse(),
            module: defaultModule(),
        });
    };

    return (
        <Dialog open={open} onClose={onClose} TransitionProps={{ onEnter }}>
            <DialogTitle>{t("assignment:titleCopyAssignment")}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} direction="column">
                    <Grid item>
                        <Typography>
                            {t("assignment:bodyCopyAssignment")}
                        </Typography>
                    </Grid>
                    {/* Course selection */}
                    <Grid item>
                        <LabeledSelect
                            sx={{
                                minWidth: 200,
                            }}
                            fullWidth
                            label={t("course")}
                            value={selection.course ? selection.course.id : ""}
                            onChange={handleChangeCourse}
                            disabled={openCourses.length === 0}
                        >
                            {openCourses.map((c) => {
                                return (
                                    <MenuItem
                                        key={c.id}
                                        selected={
                                            selection.course
                                                ? selection.course.id === c.id
                                                : false
                                        }
                                        value={c.id}
                                    >
                                        {c.title}
                                    </MenuItem>
                                );
                            })}
                        </LabeledSelect>
                    </Grid>
                    {/* Module selection */}
                    <Grid item>
                        <LabeledSelect
                            sx={{
                                minWidth: 200,
                            }}
                            fullWidth
                            label={t("module")}
                            value={selection.module ? selection.module.id : ""}
                            onChange={handleChangeModule}
                            disabled={
                                !selection.course ||
                                !selection.course.modules ||
                                selection.course.modules.length === 0
                            }
                        >
                            {selection.course &&
                                selection.course.modules &&
                                selection.course.modules.map((m) => {
                                    return (
                                        <MenuItem
                                            key={m.id}
                                            selected={
                                                module
                                                    ? module.id === m.id
                                                    : false
                                            }
                                            value={m.id}
                                        >
                                            {m.title}
                                        </MenuItem>
                                    );
                                })}
                        </LabeledSelect>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t("cancel")}</Button>
                <WaitingOverlay waiting={copying}>
                    <Button
                        color="primary"
                        key={`${
                            !selection.course || !selection.module || copying
                        }`}
                        disabled={
                            !selection.course || !selection.module || copying
                        }
                        onClick={handleSubmit}
                    >
                        {t("continue")}
                    </Button>
                </WaitingOverlay>
            </DialogActions>
        </Dialog>
    );
}
