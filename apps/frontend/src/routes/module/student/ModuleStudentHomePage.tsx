import { Alert, Grid } from "@mui/material";
import { RoleType } from "core";
import { CourseStudentLayout } from "features/course/student/layout/CourseStudentLayout";
import { CourseStudentAssignmentsDataTable } from "features/module/student/dashboard/CourseStudentAssignmentsDataTable";
import { ModuleStudentInfo } from "features/module/student/dashboard/ModuleStudentInfo";
import {
    moduleIsAvailable,
    moduleIsOpen,
} from "features/module/student/utils/ModuleStudentUtils";
import { Module } from "interface/Module.interface";
import { useTranslation } from "react-i18next";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { PageHeading } from "ui/PageHeading";

interface ModuleStudentHomePageProps {
    module: Module;
}

export function ModuleStudentHomePage(props: ModuleStudentHomePageProps) {
    const { module } = props;
    const { t } = useTranslation();
    const course = module?.course;

    const isAvailable = moduleIsAvailable(module, course);
    const open = moduleIsOpen(module, course);

    if (course?.role !== RoleType.courseStudent || (open && !isAvailable)) {
        return <AccessErrorPage />;
    }

    return (
        <CourseStudentLayout courseId={course?.id}>
            <Grid container direction="column" spacing={2}>
                <Grid item xs={12} style={{ width: "100%" }}>
                    <PageHeading title={module?.title || t("module:noTitle")} />
                </Grid>

                {course?.archived ? (
                    <Grid item xs={12}>
                        <Alert severity="info">
                            {t("course:archivedMessageStudent")}
                        </Alert>
                    </Grid>
                ) : (
                    <Grid item xs={12} style={{ width: "100%" }}>
                        <ModuleStudentInfo module={module} />
                    </Grid>
                )}

                <Grid item xs={12} style={{ width: "100%" }}>
                    <CourseStudentAssignmentsDataTable module={module} />
                </Grid>
            </Grid>
        </CourseStudentLayout>
    );
}
