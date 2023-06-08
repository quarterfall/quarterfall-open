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
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Course } from "interface/Course.interface";
import { Module } from "interface/Module.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LabeledSelect } from "ui/form/inputs/LabeledSelect";
import { WaitingOverlay } from "ui/WaitingOverlay";
import { useCopyModule } from "./api/Module.data";

export interface CopyModuleDialogProps {
    module: Module;
    course: Course;
    open: boolean;
    onClose?: () => void;
}

export function CopyModuleDialog(props: CopyModuleDialogProps) {
    const [copyModuleMutation] = useCopyModule();
    const { me } = useAuthContext();
    const { showSuccessToast } = useToast();
    const [copying, setCopying] = useState(false);
    const { t } = useTranslation();
    const can = usePermission();

    const openCourses = (me?.courses || []).filter(
        (c) => can(Permission.updateCourse, c) && !c.archived
    );

    // helper function for determining the default course
    const defaultCourse = () => {
        if (!props.course.archived) {
            return props.course;
        }
        return openCourses.length > 0 ? openCourses[0] : null;
    };

    const { open, onClose, module } = props;

    const [course, setCourse] = useState<Course | null>(defaultCourse());

    const handleChangeCourse = (event) => {
        // find the course and choose the first module by default
        const newCourse =
            openCourses.find((c) => c.id === event.target.value) || null;
        setCourse(newCourse);
    };

    const handleSubmit = async () => {
        if (!course) {
            return;
        }
        setCopying(true);
        await copyModuleMutation({
            variables: {
                id: module.id,
                courseId: course.id,
            },
        });
        setCopying(false);
        showSuccessToast(t("module:moduleCopiedNotification"));
        if (onClose) {
            onClose();
        }
    };

    const onEnter = () => {
        setCourse(defaultCourse());
    };

    return (
        <Dialog open={open} onClose={onClose} TransitionProps={{ onEnter }}>
            <DialogTitle>{t("module:titleCopyModule")}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} direction="column">
                    <Grid item>
                        <Typography>{t("module:bodyCopyModule")}</Typography>
                    </Grid>
                    {/* Course selection */}
                    <Grid item>
                        <LabeledSelect
                            sx={{
                                minWidth: 200,
                            }}
                            fullWidth
                            label={t("course")}
                            value={course ? course.id : ""}
                            onChange={handleChangeCourse}
                            disabled={openCourses.length === 0}
                        >
                            {openCourses.map((c) => (
                                <MenuItem
                                    key={c.id}
                                    selected={
                                        course ? course.id === c.id : false
                                    }
                                    value={c.id}
                                >
                                    {c.title}
                                </MenuItem>
                            ))}
                        </LabeledSelect>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t("cancel")}</Button>
                <WaitingOverlay waiting={copying}>
                    <Button
                        color="primary"
                        key={`${!course || copying}`}
                        disabled={!course || copying}
                        onClick={handleSubmit}
                    >
                        {t("continue")}
                    </Button>
                </WaitingOverlay>
            </DialogActions>
        </Dialog>
    );
}
