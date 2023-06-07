import { Box, Button, Grid, Hidden, Paper, Typography } from "@mui/material";
import { ImageLayout } from "components/layout/ImageLayout";
import { useAuthContext } from "context/AuthProvider";
import { Permission } from "core";
import { useImportCourse } from "features/course/api/Course.data";
import { usePermission } from "hooks/usePermission";
import { Course } from "interface/Course.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { WaitingOverlay } from "ui/WaitingOverlay";

export interface CourseImportAuthenticatedProps {
    course?: Course;
    code: string;
}

export function CourseImportAuthenticated(
    props: CourseImportAuthenticatedProps
) {
    const { course, code } = props;

    const { t } = useTranslation();
    const [importCourseMutation] = useImportCourse();
    const [importing, setImporting] = useState(false);
    const { me, refetch } = useAuthContext();
    const can = usePermission();

    const handleImportCourse = async () => {
        setImporting(true);
        const result = await importCourseMutation({
            variables: { input: { code } },
        });

        // refetch the 'me' data
        await refetch();
        setImporting(false);
        // update the current id to be the new course
        const newId = result.data?.importCourse.id;
        if (newId) {
            window.location.href = `${window.location.origin}/course/${newId}`;
        }
    };

    // verify that the user can import a course
    if (!can(Permission.createCourse)) {
        return <AccessErrorPage />;
    }

    const renderContent = () => (
        <Grid container direction="column" spacing={4} alignItems="center">
            <Grid item>
                <Typography variant="h6" align="center">
                    {t("course:importCourseTitle")}
                </Typography>
            </Grid>
            <Grid item>
                <Typography
                    variant="body1"
                    align="center"
                    color="textSecondary"
                >
                    {t("course:importCourseBody", course)}
                </Typography>
            </Grid>
            <Grid item>
                <WaitingOverlay waiting={importing}>
                    <Button
                        size="large"
                        color="primary"
                        variant="contained"
                        onClick={handleImportCourse}
                        disabled={importing}
                    >
                        {t("course:import")}
                    </Button>
                </WaitingOverlay>
            </Grid>
        </Grid>
    );

    const renderCodeNotFound = () => (
        <Grid container direction="column" spacing={4} alignItems="center">
            <Grid item>
                <Typography variant="h6" align="center">
                    {t("course:codeNotFoundTitle")}
                </Typography>
            </Grid>
            <Grid item>
                <Typography
                    variant="body1"
                    align="center"
                    color="textSecondary"
                >
                    {t("course:codeNotFoundBody", { code })}
                </Typography>
            </Grid>
            <Grid item>
                <Button
                    size="large"
                    color="primary"
                    variant="contained"
                    onClick={() => {
                        window.location.href = window.location.origin;
                    }}
                >
                    {t("continue")}
                </Button>
            </Grid>
        </Grid>
    );

    return (
        <ImageLayout image={`/background_course.jpg`}>
            <Hidden smUp>
                <Box
                    component="div"
                    sx={{ padding: (theme) => theme.spacing(4, 2, 0) }}
                >
                    {course ? renderContent() : renderCodeNotFound()}
                </Box>
            </Hidden>
            <Hidden smDown>
                <Box display="flex" justifyContent="center">
                    <Paper
                        sx={{
                            width: 500,
                            padding: (theme) => theme.spacing(8, 4, 6),
                            marginTop: (theme) => theme.spacing(3),
                        }}
                    >
                        {course ? renderContent() : renderCodeNotFound()}
                    </Paper>
                </Box>
            </Hidden>
        </ImageLayout>
    );
}
