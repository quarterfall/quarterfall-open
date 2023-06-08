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
import { useCreateCourse } from "features/course/api/Course.data";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DateTimeController } from "ui/form/DateTimeController";
import { TextFieldController } from "ui/form/TextFieldController";
import { useNavigation } from "ui/route/Navigation";
import { WaitingOverlay } from "ui/WaitingOverlay";

export interface CreateCourseDialogProps {
    open: boolean;
    onClose?: () => void;
    onComplete?: () => void;
    onError?: (error) => void;
}

export function CreateCourseDialog(props: CreateCourseDialogProps) {
    const { t } = useTranslation();
    const [createCourseMutation] = useCreateCourse();
    const [creating, setCreating] = useState(false);
    const { refetch } = useAuthContext();
    const router = useNavigation();

    const startDate = new Date(Date.now());
    const endDate = add(startDate, { months: 3 });

    const defaultValues = {
        title: "",
        description: "",
        startDate,
        endDate,
    };

    const {
        open = false,
        onClose = () => void 0,
        onComplete = () => void 0,
        onError = (error) => void 0,
    } = props;

    // Form for the course creation
    const {
        control,
        handleSubmit,
        formState: { isValid },
        watch,
        reset,
    } = useForm<{
        title: string;
        description?: string;
        startDate: Date;
        endDate: Date;
    }>({
        mode: "onChange",
        defaultValues,
    });

    const onSubmit = async (input: {
        title: string;
        description?: string;
        startDate: Date;
        endDate: Date;
    }) => {
        try {
            setCreating(true);
            const result = await createCourseMutation({
                variables: {
                    input,
                    defaultModuleName: t("assignments"),
                },
            });

            // refetch the 'me' data
            await refetch();
            setCreating(false);
            // update the current id to be the new course
            const newId = result.data?.createCourse.id;
            if (newId) {
                router.push(`/course/${newId}`);
            }
            onComplete();
        } catch (error) {
            setCreating(false);
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
                <DialogTitle>{t("course:titleCreateCourse")}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} direction="column">
                        <Typography>{t("course:bodyCreateCourse")}</Typography>

                        {/* Course title input */}
                        <TextFieldController
                            control={control}
                            autoFocus
                            fullWidth
                            label={t("course:title")}
                            name="title"
                            required
                            data-cy="createCourseDialogTitle"
                        />

                        <DateTimeController
                            control={control}
                            label={t("startDateTime")}
                            name="startDate"
                            maxDateTime={watch("endDate")}
                            required
                        />
                        <DateTimeController
                            control={control}
                            label={t("endDateTime")}
                            name="endDate"
                            minDateTime={watch("startDate")}
                            required
                        />

                        {/* Course description input */}

                        <TextFieldController
                            control={control}
                            fullWidth
                            multiline
                            label={t("description")}
                            name="description"
                            data-cy="createCourseDialogDescription"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("cancel")}</Button>
                    <WaitingOverlay waiting={creating}>
                        <Button
                            type="submit"
                            color="primary"
                            key={`${!isValid || creating}`}
                            disabled={!isValid || creating}
                            data-cy="createCourseDialogSubmit"
                        >
                            {t("continue")}
                        </Button>
                    </WaitingOverlay>
                </DialogActions>
            </form>
        </Dialog>
    );
}
