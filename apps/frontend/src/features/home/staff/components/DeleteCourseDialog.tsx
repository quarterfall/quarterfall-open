import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Typography,
} from "@mui/material";
import { useDeleteCourse } from "features/course/api/Course.data";
import { Course } from "interface/Course.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { WaitingOverlay } from "ui/WaitingOverlay";

export interface DeleteCourseDialogProps {
    course?: Course;
    open: boolean;
    onComplete?: () => void;
    onError?: (error) => void;
    onClose?: () => void;
}

export function DeleteCourseDialog(props: DeleteCourseDialogProps) {
    const [deleteCourseMutation] = useDeleteCourse();
    const [deleting, setDeleting] = useState(false);
    const { t } = useTranslation();

    const {
        open = false,
        onClose = () => void 0,
        onComplete = () => void 0,
        onError = (error) => void 0,
        course,
    } = props;

    const handleSubmit = async () => {
        try {
            setDeleting(true);
            await deleteCourseMutation({
                variables: {
                    id: course?.id,
                },
            });
            onComplete();
            setDeleting(false);
        } catch (error) {
            onError(error);
        }
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{t("course:confirmDeleteTitle")}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} direction="column">
                    <Grid item>
                        <Typography>
                            {t("course:confirmDeleteMessage")}
                        </Typography>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t("cancel")}</Button>
                <WaitingOverlay waiting={deleting}>
                    <Button
                        color="primary"
                        key={`${deleting}`}
                        disabled={deleting}
                        onClick={handleSubmit}
                        data-cy="deleteCourseDialogSubmit"
                    >
                        {t("continue")}
                    </Button>
                </WaitingOverlay>
            </DialogActions>
        </Dialog>
    );
}
