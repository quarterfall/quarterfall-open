import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import {
    Divider,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    MenuProps,
} from "@mui/material";
import { Permission } from "core";
import { useUpdateCourse } from "features/course/api/Course.data";
import { DeleteCourseDialog } from "features/home/staff/components/DeleteCourseDialog";
import { DuplicateCourseDialog } from "features/home/staff/components/DuplicateCourseDialog";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Course } from "interface/Course.interface";
import DuplicateIcon from "mdi-material-ui/ContentDuplicate";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { useNavigation } from "ui/route/Navigation";
export interface CourseActionMenuProps extends MenuProps {
    course?: Course;
    onRefresh?: () => void;
}

export function CourseActionMenu(props: CourseActionMenuProps) {
    const {
        course,
        onClose = () => void 0,
        onRefresh = () => void 0,
        ...rest
    } = props;
    const [deleteCourseOpen, setDeleteCourseOpen] = useState(false);
    const [archiveCourseOpen, setArchiveCourseOpen] = useState(false);
    const [duplicateCourseOpen, setDuplicateCourseOpen] = useState(false);
    const [updateCourseMutation] = useUpdateCourse();
    const { t } = useTranslation();
    const { showSuccessToast, showErrorToast } = useToast();
    const router = useNavigation();

    const [waiting, setWaiting] = useState(false);

    const can = usePermission();
    const isCancelled = useRef(false);

    useEffect(() => {
        return () => {
            isCancelled.current = true;
        };
    }, []);

    const handleClickDelete = () => {
        setDeleteCourseOpen(true);
    };

    const handleClickArchive = () => {
        setArchiveCourseOpen(true);
    };

    const handleClickEdit = () => {
        if (!course) {
            return;
        }
        router.push(`/course/${course.id}`);
    };

    const handleClickDuplicate = () => {
        setDuplicateCourseOpen(true);
    };

    const handleDuplicateCourseComplete = () => {
        showSuccessToast(t("course:confirmCourseDuplicated"));

        if (!isCancelled.current) {
            setDuplicateCourseOpen(false);
            onClose({}, "backdropClick");
        }
    };

    const handleDuplicateCourseError = (error) => {
        setDuplicateCourseOpen(false);
        showErrorToast(t("unknownError"));
        onClose({}, "backdropClick");
    };

    const handleDuplicateCourseClose = () => {
        setDuplicateCourseOpen(false);
        onClose({}, "backdropClick");
    };

    const handleArchive = async () => {
        setArchiveCourseOpen(false);
        setWaiting(true);
        await updateCourseMutation({
            variables: {
                id: course?.id,
                input: { archived: true },
            },
        });
        setWaiting(false);
        showSuccessToast(t("course:courseArchivedNotification"));
        onClose({}, "backdropClick");
        onRefresh();
    };

    const handleArchiveCancel = async () => {
        setArchiveCourseOpen(false);
        onClose({}, "backdropClick");
    };

    const handleDeleteCourseComplete = () => {
        setDeleteCourseOpen(false);
        showSuccessToast(t("course:courseDeletedNotification"));
        onClose({}, "backdropClick");
        onRefresh();
    };

    const handleDeleteCourseError = () => {
        setDeleteCourseOpen(false);
        showErrorToast(t("unknownError"));
        onClose({}, "backdropClick");
    };

    const handleDeleteCourseClose = () => {
        setDeleteCourseOpen(false);
        onClose({}, "backdropClick");
    };

    return (
        <>
            <Menu id="course-action-menu" {...rest} onClose={onClose}>
                <MenuItem onClick={handleClickEdit}>
                    <ListItemIcon>
                        <SearchIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("view")} />
                </MenuItem>

                <Divider />

                {can(Permission.createCourse) && (
                    <MenuItem
                        onClick={handleClickDuplicate}
                        data-cy="copyCourseMenuItem"
                        dense={false}
                    >
                        <ListItemIcon>
                            <DuplicateIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("duplicate")} />
                    </MenuItem>
                )}

                {!course?.archived && can(Permission.updateCourse, course) && (
                    <MenuItem onClick={handleClickArchive}>
                        <ListItemIcon
                            sx={{
                                color: "error.main",
                            }}
                            data-cy="archiveCourseMenuItem"
                        >
                            <ArchiveIcon />
                        </ListItemIcon>
                        <ListItemText
                            sx={{
                                color: "error.main",
                            }}
                            primary={t("course:archive")}
                        />
                    </MenuItem>
                )}
                {course?.archived && can(Permission.deleteCourse, course) && (
                    <MenuItem onClick={handleClickDelete}>
                        <ListItemIcon
                            sx={{
                                color: "error.main",
                            }}
                            data-cy="deleteCourseMenuItem"
                        >
                            <DeleteIcon />
                        </ListItemIcon>
                        <ListItemText
                            sx={{
                                color: "error.main",
                            }}
                            primary={t("course:delete")}
                        />
                    </MenuItem>
                )}
            </Menu>
            {/* Duplicate course dialog */}
            <DuplicateCourseDialog
                open={duplicateCourseOpen}
                onComplete={handleDuplicateCourseComplete}
                onError={handleDuplicateCourseError}
                onClose={handleDuplicateCourseClose}
                course={course}
            />

            {/* Archive course confirmation dialog */}
            <ConfirmationDialog
                open={archiveCourseOpen}
                title={t("course:confirmArchiveTitle")}
                message={t("course:confirmArchiveMessage")}
                onContinue={handleArchive}
                onCancel={handleArchiveCancel}
                waiting={waiting}
            />

            {/* Delete course confirmation dialog */}
            <DeleteCourseDialog
                course={course}
                open={deleteCourseOpen}
                onComplete={handleDeleteCourseComplete}
                onError={handleDeleteCourseError}
                onClose={handleDeleteCourseClose}
            />
        </>
    );
}
