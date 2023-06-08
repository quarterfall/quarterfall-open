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
import { useImportCourse } from "features/course/api/Course.data";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DateTimeController } from "ui/form/DateTimeController";
import { TextFieldController } from "ui/form/TextFieldController";
import { WaitingOverlay } from "ui/WaitingOverlay";

export interface ImportCourseDialogProps {
    open: boolean;
    onClose?: () => void;
    onComplete?: (newCourseId: string) => void;
}

export function ImportCourseDialog(props: ImportCourseDialogProps) {
    const { t } = useTranslation();
    const [importCourseMutation] = useImportCourse();
    const [importing, setImporting] = useState(false);
    const { refetch } = useAuthContext();

    const {
        open = false,
        onClose = () => void 0,
        onComplete = () => void 0,
    } = props;

    const startDate = new Date(Date.now());
    const endDate = add(startDate, { months: 3 });

    const defaultValues = {
        code: "",
        startDate,
        endDate,
    };
    // Form for the course import
    const {
        control,
        formState: { isValid },
        handleSubmit,
        setError,
        watch,
        reset,
    } = useForm<{
        code: string;
        startDate?: Date;
        endDate?: Date;
    }>({
        mode: "onChange",
        defaultValues,
    });

    const onSubmit = async (input: {
        code: string;
        startDate?: Date;
        endDate?: Date;
    }) => {
        try {
            setImporting(true);

            // import the course
            const result = await importCourseMutation({
                variables: {
                    input,
                },
            });

            setImporting(false);

            // refetch the 'me' data to update the course list
            await refetch();

            // update the current id to be the new course
            const newId = result.data?.importCourse.id;
            if (newId) {
                onComplete(newId);
            }
        } catch (error) {
            setImporting(false);
            setError("code", { message: t("codeNotFoundError") });
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
                <DialogTitle>{t("course:titleImportCourse")}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} direction="column">
                        <Typography>{t("course:bodyImportCourse")}</Typography>
                        {/* Course code input */}
                        <TextFieldController
                            control={control}
                            autoFocus
                            fullWidth
                            label={t("shareCode")}
                            name="code"
                            required
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
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("cancel")}</Button>
                    <WaitingOverlay waiting={importing}>
                        <Button
                            type="submit"
                            color="primary"
                            key={`${!isValid || importing}`}
                            disabled={!isValid || importing}
                        >
                            {t("continue")}
                        </Button>
                    </WaitingOverlay>
                </DialogActions>
            </form>
        </Dialog>
    );
}
