import { Alert, Box, Grid } from "@mui/material";
import { CourseStudentInfo } from "features/course/student/dashboard/CourseStudentInfo";
import { CourseStudentModulesDataTable } from "features/course/student/dashboard/CourseStudentModulesDataTable";
import { CourseStudentLayout } from "features/course/student/layout/CourseStudentLayout";
import { Course } from "interface/Course.interface";
import { useTranslation } from "react-i18next";
import { PageHeading } from "ui/PageHeading";

export interface CourseStudentDashboardPageProps {
    course: Course;
}

export function CourseStudentDashboardPage(
    props: CourseStudentDashboardPageProps
) {
    const { course } = props;
    const { t } = useTranslation();

    return (
        <CourseStudentLayout selected="dashboard">
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <PageHeading
                        title={course.title}
                        description={course.description}
                    />
                </Grid>
                {course?.archived && (
                    <Grid item xs={12}>
                        <Alert severity="info">
                            {t("course:archivedMessageStudent")}
                        </Alert>
                    </Grid>
                )}
                <Grid item xs={12}>
                    <CourseStudentInfo course={course} />
                </Grid>
                <Grid item xs={12}>
                    <CourseStudentModulesDataTable course={course} />
                </Grid>
                <Grid item xs={12}>
                    <Box height={15} />
                </Grid>
            </Grid>
        </CourseStudentLayout>
    );
}
