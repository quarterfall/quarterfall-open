import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from "@mui/material";
import { useAuthContext } from "context/AuthProvider";
import { Course } from "interface/Course.interface";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TextFieldController } from "ui/form/TextFieldController";
import { useNavigation } from "ui/route/Navigation";
import { WaitingOverlay } from "ui/WaitingOverlay";
import { useEnrollToCourse } from "../api/StudentHome.data";

interface EnrollCourseDialogProps {
    open: boolean;
    onClose?: () => void;
    onComplete?: (course: Course) => void;
    onError?: (error) => void;
}

export const EnrollCourseDialog = (props: EnrollCourseDialogProps) => {
    const { open, onClose, onComplete, onError } = props;
    const router = useNavigation();
    const { t } = useTranslation();
    const { refetch } = useAuthContext();

    const [waiting, setWaiting] = useState(false);

    const [enrollToCourseMutation] = useEnrollToCourse();

    const defaultValues = {
        enrollmentCode: "",
    };

    // Form for the course creation
    const {
        control,
        handleSubmit,
        formState: { isValid },
        watch,
        reset,
    } = useForm<{
        enrollmentCode: string;
    }>({
        mode: "onChange",
        defaultValues,
    });

    const onSubmit = async (input: { enrollmentCode: string }) => {
        try {
            setWaiting(true);
            const result = await enrollToCourseMutation({
                variables: {
                    enrollmentCode: input.enrollmentCode,
                },
            });

            // refetch the 'me' data
            await refetch();
            setWaiting(false);
            // update the current id to be the new course
            const newCourse = result.data?.enrollToCourse;
            const newId = newCourse?.id;
            if (newId) {
                router.push(`/student/course/${newId}`);
            }
            onComplete(newCourse);
        } catch (error) {
            setWaiting(false);
            onError(error);
        }
        onClose();
    };

    const onEnter = () => {
        // unfortunately, the timeout is needed due to a limitation of
        // react-hook-form and Material-UI dialogs
        setTimeout(() => {
            reset(defaultValues);
        }, 100);
    };
    return (
        <Dialog open={open} onClose={onClose} TransitionProps={{ onEnter }}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{t("course:titleEnrollIntoCourse")}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} direction="column">
                        <Typography>
                            {t("course:bodyEnrollIntoCourse")}
                        </Typography>
                        {/* Course title input */}
                        <TextFieldController
                            control={control}
                            autoFocus
                            fullWidth
                            label={t("course:enrollmentCode")}
                            name="enrollmentCode"
                            required
                            data-cy="enrollToCourseDialogTitle"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("cancel")}</Button>
                    <WaitingOverlay waiting={waiting}>
                        <Button
                            type="submit"
                            color="primary"
                            key={`${!isValid || waiting}`}
                            disabled={!isValid || waiting}
                        >
                            {t("continue")}
                        </Button>
                    </WaitingOverlay>
                </DialogActions>
            </form>
        </Dialog>
    );
};
