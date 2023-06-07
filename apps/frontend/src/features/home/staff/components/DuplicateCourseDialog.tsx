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
import { add } from "date-fns";
import { useDuplicateCourse } from "features/course/api/Course.data";
import { Course } from "interface/Course.interface";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DateTimeController } from "ui/form/DateTimeController";
import { TextFieldController } from "ui/form/TextFieldController";
import { useNavigation } from "ui/route/Navigation";
import { WaitingOverlay } from "ui/WaitingOverlay";

export interface DuplicateCourseDialogProps {
    open?: boolean;
    onComplete?: () => void;
    onError?: (error) => void;
    onClose?: () => void;
    course?: Course;
}

export function DuplicateCourseDialog(props: DuplicateCourseDialogProps) {
    const { t } = useTranslation();
    const [waiting, setWaiting] = useState(false);
    const [duplicateCourseMutation] = useDuplicateCourse();
    const { refetch } = useAuthContext();
    const router = useNavigation();

    const {
        open = false,
        onClose = () => void 0,
        onComplete = () => void 0,
        onError = (error) => void 0,
        course,
    } = props;

    const startDate = new Date(Date.now());
    const endDate = add(startDate, { months: 3 });

    const defaultValues = {
        title: course.title,
        startDate,
        endDate,
    };

    // Form for the assignment creation
    const {
        control,
        handleSubmit,
        formState: { isValid },
        watch,
        reset,
    } = useForm<{ title: string; startDate?: Date; endDate?: Date }>({
        mode: "onChange",
        defaultValues,
    });

    const onSubmit = async (input: {
        title: string;
        startDate?: Date;
        endDate?: Date;
    }) => {
        const { title, startDate, endDate } = input;
        try {
            setWaiting(true);
            const result = await duplicateCourseMutation({
                variables: {
                    input: { title, startDate, endDate },
                    courseId: course?.id || "",
                },
            });
            // refetch the 'me' data
            await refetch();
            // update the current id to be the new course
            const newId = result.data?.duplicateCourse.id;
            setWaiting(false);

            if (newId) {
                router.push(`/course/${newId}`);
            }
            onComplete();
        } catch (error) {
            onError(error);
        }

        if (onClose) {
            onClose();
        }
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
                <DialogTitle>{t("course:titleDuplicateCourse")}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} direction="column">
                        <Typography>
                            {t("course:bodyDuplicateCourse")}
                        </Typography>

                        {/* Course title input */}
                        <TextFieldController
                            control={control}
                            autoFocus
                            fullWidth
                            label={t("course:title")}
                            name="title"
                            required
                            data-cy="copyCourseDialogTitle"
                        />

                        <DateTimeController
                            control={control}
                            label={t("startDateTime")}
                            name="startDate"
                            maxDateTime={watch("endDate")}
                            required
                        />
                        <DateTimeController
                            label={t("endDateTime")}
                            name="endDate"
                            minDateTime={watch("startDate")}
                            control={control}
                            required
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("cancel")} </Button>
                    <WaitingOverlay waiting={waiting}>
                        <Button
                            data-cy="copyCourseDialogSubmit"
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
}
