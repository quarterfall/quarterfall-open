import AddIcon from "@mui/icons-material/Add";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import { Button, Grid } from "@mui/material";
import { useDataTableQuery } from "components/dataview/datatable/DataTableQuery";
import { Layout } from "components/layout/Layout";
import { useAuthContext } from "context/AuthProvider";
import { useStore } from "context/UIStoreProvider";
import { Permission, SortingOrder } from "core";
import { Invitations } from "features/home/components/Invitations";
import { CourseSearchQuery } from "features/home/staff/interface/CourseSearchQuery";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "ui/route/Navigation";
import { CourseGrid } from "./CourseGrid";
import { CreateCourseDialog } from "./CreateCourseDialog";
import { ImportCourseDialog } from "./ImportCourseDialog";

export function HomeStaff() {
    const { t } = useTranslation();
    const [addCourseDialogOpen, setAddCourseDialogOpen] = useState(false);
    const [importCourseDialogOpen, setImportCourseDialogOpen] = useState(false);
    const { showSuccessToast, showErrorToast } = useToast();
    const can = usePermission();
    const { me } = useAuthContext();
    const router = useNavigation();

    const { courseFilters, setCourseFilters } = useStore();

    const [query, updateQuery] = useDataTableQuery<CourseSearchQuery>({
        orderBy: courseFilters.orderBy,
        order: SortingOrder[courseFilters.order],
        allCourses: courseFilters.allCourses,
        hideArchived: courseFilters.hideArchived,
    });

    const handleClickCreateCourse = () => {
        setAddCourseDialogOpen(true);
    };

    const handleClickImportCourse = () => {
        setImportCourseDialogOpen(true);
    };

    const handleCreateCourseComplete = () => {
        showSuccessToast(t("course:createdNotification"));
        updateQuery({ page: 1 });
    };

    const handleImportCourseComplete = (newCourseId: string) => {
        showSuccessToast(t("course:importedNotification"));
        router.push(`/course/${newCourseId}`);
    };

    const handleCreateCourseError = (error) => {
        showErrorToast(t("unknownError"));
    };

    const handleCreateImportCourseClose = () => {
        setAddCourseDialogOpen(false);
        setImportCourseDialogOpen(false);
    };

    useEffect(() => {
        setCourseFilters({
            orderBy: query.orderBy,
            order: query.order,
            allCourses: query.allCourses,
            hideArchived: query.hideArchived,
        });
    }, [query]);

    return (
        <Layout>
            <Grid
                container
                direction="column"
                spacing={1}
                sx={{
                    padding: 4,
                }}
            >
                {me?.invitations.length > 0 && (
                    <Grid item xs={12}>
                        <Invitations />
                    </Grid>
                )}
                <Grid item xs={12}>
                    <CourseGrid
                        query={{ ...query, pageSize: 12 }}
                        updateQuery={updateQuery}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Grid container direction="row" spacing={1}>
                        {can(Permission.createCourse) && (
                            <Grid item>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    onClick={handleClickCreateCourse}
                                    startIcon={<AddIcon />}
                                    data-cy="createCourseButton"
                                >
                                    {t("course:create")}
                                </Button>
                            </Grid>
                        )}
                        {can(Permission.createCourse) && (
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={handleClickImportCourse}
                                    startIcon={<ImportExportIcon />}
                                    data-cy="importCourseButton"
                                >
                                    {t("course:import")}
                                </Button>
                            </Grid>
                        )}
                    </Grid>

                    <CreateCourseDialog
                        open={addCourseDialogOpen}
                        onClose={handleCreateImportCourseClose}
                        onComplete={handleCreateCourseComplete}
                        onError={handleCreateCourseError}
                    />

                    <ImportCourseDialog
                        open={importCourseDialogOpen}
                        onClose={handleCreateImportCourseClose}
                        onComplete={handleImportCourseComplete}
                    />
                </Grid>
            </Grid>
        </Layout>
    );
}
