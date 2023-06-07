import AddIcon from "@mui/icons-material/Add";
import { Alert, Button, Grid, Paper } from "@mui/material";
import { hasErrorCode, Permission, ServerError } from "core";
import { CourseStaffLayout } from "features/course/staff/layout/CourseStaffLayout";
import { useCourseTeam } from "features/course/staff/team/api/CourseTeam.data";
import { CourseTeamDataTable } from "features/course/staff/team/CourseTeamDataTable";
import { AddCourseUsersDialog } from "features/course/staff/users/AddCourseUsersDialog";

import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { PageHeading } from "ui/PageHeading";
import { useParams } from "ui/route/Params";
export function CourseTeamPage() {
    const { t } = useTranslation();
    const can = usePermission();
    const { showErrorToast, showSuccessToast } = useToast();
    const [addUsersDialogOpen, setAddUsersDialogOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
    const { id } = useParams<{ id: string }>();
    const { data, loading, refetch } = useCourseTeam(id);

    const course = data?.course;

    if (data && !loading && !can(Permission.readCourseUser, course)) {
        return <AccessErrorPage />;
    }

    const handleAddCourseUsers = () => {
        showSuccessToast(t("course:usersAddedToast"));
        setAddUsersDialogOpen(false);
        refetch();
        setSelectedStaff([]);
    };

    const handleAddCourseUsersError = (error) => {
        if (hasErrorCode(error, ServerError.UserAlreadyHasRole)) {
            showErrorToast(t("course:userAlreadyHasRoleError"));
        } else if (hasErrorCode(error, ServerError.UsersCannotBeCourseAdmins)) {
            showErrorToast(t("course:usersCannotBeCourseAdminsError"));
        } else {
            showErrorToast(t("unknownError"));
        }

        setAddUsersDialogOpen(false);
        setSelectedStaff([]);
    };

    const canUpdateUsers = can(Permission.updateCourseUser, course);

    return (
        <CourseStaffLayout selected="team">
            <Grid container direction="column" spacing={1}>
                <Grid item xs={12}>
                    <Grid item xs={12}>
                        <PageHeading title={t("team")} />
                    </Grid>
                </Grid>
                {course?.archived && (
                    <Grid item>
                        <Alert severity="info">
                            {t("course:archivedMessageStaff")}
                        </Alert>
                    </Grid>
                )}

                {/* Users */}
                <Grid item xs={12}>
                    <Paper>
                        <CourseTeamDataTable
                            course={course}
                            loading={loading}
                            refetch={refetch}
                            selectedStaff={selectedStaff}
                            setSelectedStaff={setSelectedStaff}
                        />
                    </Paper>
                </Grid>

                {canUpdateUsers && (
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={<AddIcon />}
                            onClick={() => setAddUsersDialogOpen(true)}
                        >
                            {t("course:addMember")}
                        </Button>
                    </Grid>
                )}
            </Grid>

            <AddCourseUsersDialog
                course={course}
                open={addUsersDialogOpen}
                onComplete={handleAddCourseUsers}
                onError={handleAddCourseUsersError}
                onClose={() => setAddUsersDialogOpen(false)}
            />
        </CourseStaffLayout>
    );
}
