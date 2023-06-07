import AddIcon from "@mui/icons-material/Add";
import { Alert, Button, Grid, Paper } from "@mui/material";
import { hasErrorCode, Permission, ServerError } from "core";
import { CourseStaffLayout } from "features/course/staff/layout/CourseStaffLayout";
import { useCourseStudents } from "features/course/staff/students/api/CourseStudents.data";
import { CourseStudentsDataTable } from "features/course/staff/students/CourseStudentsDataTable";
import { AddCourseUsersDialog } from "features/course/staff/users/AddCourseUsersDialog";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { PageHeading } from "ui/PageHeading";
import { useParams } from "ui/route/Params";
export function CourseStudentsPage() {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const can = usePermission();
    const { showSuccessToast, showErrorToast } = useToast();
    const { data, loading, refetch } = useCourseStudents(id);

    const [addUsersDialogOpen, setAddUsersDialogOpen] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

    // retrieve the course, the modules and the students
    const course = data?.course;

    if (data && !loading && !can(Permission.readCourseUser, course)) {
        return <AccessErrorPage />;
    }

    const handleAddCourseUsers = () => {
        showSuccessToast(t("course:studentsAddedToast"));
        setAddUsersDialogOpen(false);
        refetch();
        setSelectedStudents([]);
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
        setSelectedStudents([]);
    };

    const canUpdateUsers = can(Permission.updateCourseUser, course);

    return (
        <CourseStaffLayout selected="students">
            <Grid container direction="column" spacing={1}>
                <Grid item xs={12}>
                    <PageHeading title={t("students")} />
                </Grid>
                {course?.archived && (
                    <Grid item xs={12}>
                        <Alert severity="info">
                            {t("course:archivedMessageStaff")}
                        </Alert>
                    </Grid>
                )}

                {/* Users */}
                <Grid item xs={12}>
                    <Paper>
                        <CourseStudentsDataTable
                            course={course}
                            loading={loading}
                            refetch={refetch}
                            selectedStudents={selectedStudents}
                            setSelectedStudents={setSelectedStudents}
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
                            data-cy="addStudentButton"
                        >
                            {t("course:addStudents")}
                        </Button>
                    </Grid>
                )}
            </Grid>

            <AddCourseUsersDialog
                course={course}
                open={addUsersDialogOpen}
                isStudent
                onComplete={handleAddCourseUsers}
                onError={handleAddCourseUsersError}
                onClose={() => setAddUsersDialogOpen(false)}
            />
        </CourseStaffLayout>
    );
}
