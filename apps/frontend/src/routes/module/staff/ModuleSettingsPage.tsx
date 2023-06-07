import { Grid } from "@mui/material";
import { CourseStaffLayout } from "features/course/staff/layout/CourseStaffLayout";
import { EditModuleSettingsCard } from "features/module/staff/EditModuleSettingsCard";

import { Module } from "interface/Module.interface";
import { useTranslation } from "react-i18next";
import { PageHeading } from "ui/PageHeading";

type ModuleSettingsPageProps = { module: Module };

export const ModuleSettingsPage = (props: ModuleSettingsPageProps) => {
    const { module } = props;
    const { t } = useTranslation();

    return (
        <CourseStaffLayout selected="settings" courseId={module?.course?.id}>
            <Grid container direction="column" spacing={1}>
                <Grid item xs={12}>
                    <PageHeading title={t("module:editSettingsTitle")} />
                </Grid>
                <Grid item>
                    <EditModuleSettingsCard module={module} />
                </Grid>
            </Grid>
        </CourseStaffLayout>
    );
};
