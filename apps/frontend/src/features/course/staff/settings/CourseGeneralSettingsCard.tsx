import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import StorefrontIcon from "@mui/icons-material/Storefront";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Grid,
    Skeleton,
    Stack,
    Theme,
} from "@mui/material";
import { SystemAdminSettings } from "components/admin/SystemAdminSettings";
import { useStore } from "context/UIStoreProvider";
import { Permission } from "core";
import { DeleteCourseDialog } from "features/home/staff/components/DeleteCourseDialog";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Course } from "interface/Course.interface";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { useAutosaveForm } from "ui/form/Autosave";
import { DateTimeController } from "ui/form/DateTimeController";
import { SwitchController } from "ui/form/SwitchController";
import { TextFieldController } from "ui/form/TextFieldController";
import { useNavigation } from "ui/route/Navigation";
import {
    usePublishCourseToLibrary,
    useUpdateCourseSettings,
} from "./api/CourseSettings.data";

const deleteSx = (theme: Theme) => ({
    color: theme.palette.getContrastText(theme.palette.error.main),
    backgroundColor: theme.palette.error.main,
    "&:hover": {
        backgroundColor: theme.palette.error.dark,
    },
});

const dateTimeSx = {
    minWidth: "300px",
};

export interface CourseGeneralSettingsCardProps {
    course: Course;
    loading?: boolean;
}

export function CourseGeneralSettingsCard(
    props: CourseGeneralSettingsCardProps
) {
    const { t } = useTranslation();
    const { course, loading } = props;
    const router = useNavigation();
    const { showSuccessToast, showErrorToast } = useToast();
    const { setCourseId } = useStore();
    const can = usePermission();

    const readOnly = !can(Permission.updateCourse, course);

    const [deleteCourseOpen, setDeleteCourseOpen] = useState(false);
    const [archiveCourseOpen, setArchiveCourseOpen] = useState(false);
    const [showDateAlert, setShowDateAlert] = useState(false);

    const [updateCourseSettingsMutation] = useUpdateCourseSettings();
    const [publishCourseToLibraryMutation] = usePublishCourseToLibrary();

    const defaultValues = {
        ...course,
        startDate: course?.startDate ? new Date(course?.startDate) : undefined,
        endDate: course?.endDate ? new Date(course?.endDate) : undefined,
    };

    const { control, watch, reset } = useAutosaveForm<Course>({
        defaultValues,
        onSave: async (input: Partial<Course>, allData: Course) => {
            const datesInvalid =
                allData.startDate &&
                allData.endDate &&
                allData.startDate >= allData.endDate;
            setShowDateAlert(datesInvalid);
            if (datesInvalid) {
                return;
            }
            await updateCourseSettingsMutation({
                variables: {
                    id: course?.id,
                    input,
                },
            });
            showSuccessToast();
        },
    });

    const handlePublishCourseToLibrary = async () => {
        await publishCourseToLibraryMutation({
            variables: {
                courseId: course?.id,
            },
        });
        showSuccessToast(t("admin:coursePublishedToLibraryNotification"));
    };

    const handleArchive = async () => {
        setArchiveCourseOpen(false);
        await updateCourseSettingsMutation({
            variables: {
                id: course?.id,
                input: { archived: true },
            },
        });
        showSuccessToast(t("course:courseArchivedNotification"));
    };

    const handleArchiveCancel = async () => {
        setArchiveCourseOpen(false);
    };

    const handleDeleteCourseComplete = () => {
        setDeleteCourseOpen(false);
        showSuccessToast(t("course:courseDeletedNotification"));
        setCourseId("");
        if (course?.library) {
            router.push("/admin/library");
        } else {
            router.push("/");
        }
    };

    const handleDeleteCourseError = () => {
        setDeleteCourseOpen(false);
        showErrorToast(t("unknownError"));
    };

    const handleDeleteCourseClose = () => {
        setDeleteCourseOpen(false);
    };

    useEffect(() => {
        reset(defaultValues);
    }, [loading]);

    return (
        <form>
            <Card sx={{ width: "100%" }}>
                <CardHeader title={t("general")} />
                <CardContent>
                    <Grid container spacing={2} direction="column">
                        {/* Course title input */}
                        <Grid item>
                            {loading ? (
                                <Skeleton
                                    variant="rectangular"
                                    height={56}
                                    sx={{ borderRadius: 1 }}
                                />
                            ) : (
                                <TextFieldController
                                    fullWidth
                                    label={t("course:title")}
                                    name="title"
                                    control={control}
                                    required
                                    disabled={
                                        course?.archived || loading || readOnly
                                    }
                                />
                            )}
                        </Grid>
                        {/* Course code input */}
                        <Grid item>
                            {loading ? (
                                <Skeleton
                                    variant="rectangular"
                                    height={56}
                                    sx={{ borderRadius: 1 }}
                                />
                            ) : (
                                <TextFieldController
                                    fullWidth
                                    label={t("course:code")}
                                    name="code"
                                    control={control}
                                    disabled={
                                        course?.archived || loading || readOnly
                                    }
                                />
                            )}
                        </Grid>
                        {/* Course description input */}
                        <Grid item>
                            {loading ? (
                                <Skeleton
                                    variant="rectangular"
                                    height={56}
                                    sx={{ borderRadius: 1 }}
                                />
                            ) : (
                                <TextFieldController
                                    fullWidth
                                    multiline
                                    label={t("course:description")}
                                    name="description"
                                    control={control}
                                    disabled={
                                        course?.archived || loading || readOnly
                                    }
                                />
                            )}
                        </Grid>
                        {showDateAlert && (
                            <Grid item>
                                <Alert severity="error">
                                    {t("startDateShouldBeBeforeEndDate")}
                                </Alert>
                            </Grid>
                        )}
                        {!course?.library && (
                            <Grid item>
                                {loading ? (
                                    <Skeleton
                                        variant="rectangular"
                                        height={56}
                                        width={300}
                                        sx={{ borderRadius: 1 }}
                                    />
                                ) : (
                                    <Box sx={dateTimeSx}>
                                        <DateTimeController
                                            label={t("startDateTime")}
                                            name="startDate"
                                            control={control}
                                            disabled={
                                                course?.archived ||
                                                loading ||
                                                readOnly
                                            }
                                            maxDateTime={watch("endDate")}
                                        />
                                    </Box>
                                )}
                            </Grid>
                        )}
                        {!course?.library && (
                            <Grid item>
                                {loading ? (
                                    <Skeleton
                                        variant="rectangular"
                                        height={56}
                                        width={300}
                                        sx={{ borderRadius: 1 }}
                                    />
                                ) : (
                                    <Box sx={dateTimeSx}>
                                        <DateTimeController
                                            label={t("endDateTime")}
                                            name="endDate"
                                            minDateTime={watch("startDate")}
                                            control={control}
                                            disabled={
                                                course?.archived ||
                                                loading ||
                                                readOnly
                                            }
                                        />
                                    </Box>
                                )}
                            </Grid>
                        )}
                        {!course?.library && (
                            <Grid item>
                                {loading ? (
                                    <Skeleton
                                        variant="text"
                                        width={300}
                                        sx={{ borderRadius: 1 }}
                                    />
                                ) : (
                                    <SwitchController
                                        label={t("course:allStaffVisible")}
                                        name="visible"
                                        control={control}
                                        disabled={
                                            course?.archived ||
                                            loading ||
                                            readOnly
                                        }
                                    />
                                )}
                            </Grid>
                        )}
                        {/* Course demo flag (only for system admins) */}
                        <Grid item>
                            <SystemAdminSettings>
                                <Stack spacing={1} alignItems="flex-start">
                                    <SwitchController
                                        label={t("course:demo")}
                                        name="demo"
                                        control={control}
                                        disabled={
                                            course?.archived ||
                                            loading ||
                                            readOnly
                                        }
                                    />
                                    {!course?.library && (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<StorefrontIcon />}
                                            onClick={
                                                handlePublishCourseToLibrary
                                            }
                                            disabled={loading}
                                        >
                                            {t("admin:publishCourseToLibrary")}
                                        </Button>
                                    )}
                                </Stack>
                            </SystemAdminSettings>
                        </Grid>
                        {can(Permission.deleteCourse, course) && (
                            <Grid item>
                                <Align right>
                                    {!course?.archived && !course?.library && (
                                        <Button
                                            variant="contained"
                                            sx={deleteSx}
                                            onClick={() =>
                                                setArchiveCourseOpen(true)
                                            }
                                            startIcon={<ArchiveIcon />}
                                            disabled={loading || readOnly}
                                        >
                                            {t("course:archive")}
                                        </Button>
                                    )}
                                    {(course?.archived || course?.library) && (
                                        <Button
                                            variant="contained"
                                            sx={deleteSx}
                                            onClick={() =>
                                                setDeleteCourseOpen(true)
                                            }
                                            startIcon={<DeleteIcon />}
                                            disabled={loading || readOnly}
                                        >
                                            {t("course:delete")}
                                        </Button>
                                    )}
                                </Align>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>
            {/* Archive course confirmation dialog */}
            <ConfirmationDialog
                open={archiveCourseOpen}
                title={t("course:confirmArchiveTitle")}
                message={t("course:confirmArchiveMessage")}
                onContinue={handleArchive}
                onCancel={handleArchiveCancel}
            />

            {/* Delete course confirmation dialog */}
            <DeleteCourseDialog
                course={course}
                open={deleteCourseOpen}
                onComplete={handleDeleteCourseComplete}
                onError={handleDeleteCourseError}
                onClose={handleDeleteCourseClose}
            />
        </form>
    );
}
