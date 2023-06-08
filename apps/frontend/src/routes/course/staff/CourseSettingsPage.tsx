import { Alert, Grid } from "@mui/material";
import { RoleType } from "core";
import { CourseStaffLayout } from "features/course/staff/layout/CourseStaffLayout";
import { useCourseSettings } from "features/course/staff/settings/api/CourseSettings.data";
import { CourseEnrollmentCodeCard } from "features/course/staff/settings/CourseEnrollmentCodeCard";
import { CourseGeneralSettingsCard } from "features/course/staff/settings/CourseGeneralSettingsCard";
import { CourseImageCard } from "features/course/staff/settings/CourseImageCard";
import { CourseSharingCard } from "features/course/staff/settings/CourseSharingCard";
import { useTranslation } from "react-i18next";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { PageHeading } from "ui/PageHeading";
import { useParams } from "ui/route/Params";

export function CourseSettingsPage() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const { data, loading } = useCourseSettings(id);

    const course = data?.course;

    if (data && !loading && course?.role === RoleType.courseStudent) {
        return <AccessErrorPage />;
    }

    return (
        <CourseStaffLayout selected="settings">
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <PageHeading title={t("settings")} />
                </Grid>
                {course?.archived && (
                    <Grid item xs={12}>
                        <Alert severity="info">
                            {t("course:archivedMessageStaff")}
                        </Alert>
                    </Grid>
                )}
                <Grid item xs={12}>
                    <CourseGeneralSettingsCard
                        course={course}
                        loading={loading}
                    />
                </Grid>

                {!course?.archived && (
                    <Grid item xs={12}>
                        <CourseEnrollmentCodeCard
                            course={course}
                            loading={loading}
                        />
                    </Grid>
                )}
                {!course?.archived && (
                    <Grid item xs={12}>
                        <CourseSharingCard course={course} loading={loading} />
                    </Grid>
                )}

                <Grid item xs={12}>
                    <CourseImageCard course={course} loading={loading} />
                </Grid>
            </Grid>
        </CourseStaffLayout>
    );
}
