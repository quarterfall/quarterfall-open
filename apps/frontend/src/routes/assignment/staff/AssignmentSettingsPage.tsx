import { Grid } from "@mui/material";
import { Permission, RoleType } from "core";
import { AssignmentLayout } from "features/assignment/staff/layout/AssignmentLayout";
import { AssignmentGradingCard } from "features/assignment/staff/settings/AssignmentGradingCard";
import { AssignmentMetadataCard } from "features/assignment/staff/settings/AssignmentMetadataCard";
import { AssignmentSettingsCard } from "features/assignment/staff/settings/AssignmentSettingsCard";
import { AssignmentSharingCard } from "features/assignment/staff/settings/AssignmentSharingCard";
import { usePermission } from "hooks/usePermission";
import { Assignment } from "interface/Assignment.interface";
import { useTranslation } from "react-i18next";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { PageHeading } from "ui/PageHeading";

export interface AssignmentSettingsPageProps {
    assignment: Assignment;
}

export function AssignmentSettingsPage(props: AssignmentSettingsPageProps) {
    const { assignment } = props;
    const { t } = useTranslation();
    const can = usePermission();

    const module = assignment?.module;
    const course = module?.course;

    const readOnly = !can(Permission.updateCourse, course);

    if (readOnly || course?.role === RoleType.courseStudent) {
        return <AccessErrorPage />;
    }

    return (
        <AssignmentLayout selected="settings" assignment={assignment}>
            <Grid container spacing={1} direction="column">
                <Grid item xs={12}>
                    <PageHeading title={t("settings")} />
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={1} direction="column">
                        <Grid item xs={12}>
                            <AssignmentMetadataCard assignment={assignment} />
                        </Grid>

                        <Grid item xs={12}>
                            <AssignmentSettingsCard assignment={assignment} />
                        </Grid>

                        <Grid item xs={12}>
                            <AssignmentGradingCard assignment={assignment} />
                        </Grid>

                        {!readOnly && (
                            <Grid item xs={12}>
                                <AssignmentSharingCard
                                    assignment={assignment}
                                />
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </Grid>
        </AssignmentLayout>
    );
}
