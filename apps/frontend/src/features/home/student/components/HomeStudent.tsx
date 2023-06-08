import HowToRegIcon from "@mui/icons-material/HowToReg";
import { Alert, Box, Button, Grid, Stack, Typography } from "@mui/material";
import { Layout } from "components/layout/Layout";
import { useAuthContext } from "context/AuthProvider";
import { isAfter, isBefore } from "date-fns";
import { CourseCard } from "features/home/components/CourseCard";
import { Invitations } from "features/home/components/Invitations";
import { useToast } from "hooks/useToast";
import { Course } from "interface/Course.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FilterCard } from "ui/FilterCard";
import { useQueryParams } from "ui/route/QueryParams";
import { ToggleChip } from "ui/ToggleChip";
import { EnrollCourseDialog } from "./EnrollCourseDialog";

export function HomeStudent() {
    const { me } = useAuthContext();
    const { t } = useTranslation();
    const { showErrorToast, showSuccessToast } = useToast();
    const [enrollToCourseDialogOpen, setEnrollToCourseDialogOpen] =
        useState(false);
    const [params, updateParams] = useQueryParams<{
        showPast: boolean;
        showFuture: boolean;
        showCompleted: boolean;
    }>({
        showPast: true,
        showFuture: true,
        showCompleted: true,
    });
    const courseIsPast = (c: Course): boolean =>
        c.endDate && isAfter(new Date(), new Date(c.endDate));
    const courseIsFuture = (c: Course): boolean =>
        c.startDate && isBefore(new Date(), new Date(c.startDate));
    const courseIsCompleted = (c: Course): boolean => {
        const modules = c.modules || [];
        const completedModules = modules.filter((m) => m.completed);
        return completedModules.length === modules.length;
    };

    // retrieve the courses that this student is a part of
    const courses = (me?.courses || []).filter(
        (c) =>
            (params.showPast || !courseIsPast(c)) &&
            (params.showFuture || !courseIsFuture(c)) &&
            (params.showCompleted || !courseIsCompleted(c))
    );

    const handleTogglePast = () =>
        updateParams({
            showPast: !params.showPast,
        });

    const handleToggleFuture = () =>
        updateParams({
            showFuture: !params.showFuture,
        });

    const handleToggleCompleted = () =>
        updateParams({
            showCompleted: !params.showCompleted,
        });

    const handleClickEnrollToCourse = () => {
        setEnrollToCourseDialogOpen(true);
    };

    const handleCloseEnrollToCourseDialog = () => {
        setEnrollToCourseDialogOpen(false);
    };

    const handleEnrollToCourseComplete = (course: Course) => {
        showSuccessToast(
            t("course:enrolledIntoCourseNotification", {
                course: course?.title,
            })
        );
    };

    const handleEnrollToCourseError = (error) => {
        showErrorToast(t(error));
    };
    return (
        <Layout>
            <Box
                sx={{
                    paddingX: 4,
                }}
            >
                <Grid container direction="column" spacing={2}>
                    {me?.invitations.length > 0 && (
                        <Grid item xs={12}>
                            <Invitations />
                        </Grid>
                    )}
                    <Grid item>
                        <FilterCard>
                            <Stack direction="row" spacing={1}>
                                <Typography>{t("show")}</Typography>
                                <ToggleChip
                                    size="small"
                                    selected={params.showPast}
                                    label={t("course:pastCoursesChip")}
                                    onClick={handleTogglePast}
                                />
                                <ToggleChip
                                    size="small"
                                    selected={params.showFuture}
                                    label={t("course:futureCoursesChip")}
                                    onClick={handleToggleFuture}
                                />

                                <ToggleChip
                                    size="small"
                                    selected={params.showCompleted}
                                    label={t("course:completedCoursesChip")}
                                    onClick={handleToggleCompleted}
                                />
                            </Stack>
                        </FilterCard>
                    </Grid>
                    <Grid item>
                        <Grid container spacing={1}>
                            {courses.map((course) => (
                                <Grid
                                    item
                                    key={`course_${course.id}`}
                                    xs={12}
                                    sm={8}
                                    md={6}
                                    lg={4}
                                >
                                    <CourseCard course={course} />
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                    {courses.length === 0 && (
                        <Grid item>
                            <Alert severity="info">{t("course:empty")}</Alert>
                        </Grid>
                    )}
                    <Grid item>
                        <Button
                            color="primary"
                            variant="contained"
                            size="large"
                            startIcon={<HowToRegIcon />}
                            onClick={handleClickEnrollToCourse}
                        >
                            {t("course:enrollIntoCourse")}
                        </Button>
                    </Grid>
                    <EnrollCourseDialog
                        open={enrollToCourseDialogOpen}
                        onClose={handleCloseEnrollToCourseDialog}
                        onComplete={handleEnrollToCourseComplete}
                        onError={handleEnrollToCourseError}
                    />
                </Grid>
            </Box>
        </Layout>
    );
}
