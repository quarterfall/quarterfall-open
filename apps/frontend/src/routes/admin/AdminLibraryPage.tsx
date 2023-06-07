import { Box, Chip, Grid, Paper } from "@mui/material";
import { DataTable } from "components/dataview/datatable/DataTable";
import {
    DataTableQuery,
    useDataTableQuery,
} from "components/dataview/datatable/DataTableQuery";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PageHeading } from "ui/PageHeading";
import { useNavigation } from "ui/route/Navigation";
import { useSearchLibraryCourses } from "../../features/admin/api/Library.data";
import { AdminLayout } from "../../features/admin/layout/AdminLayout";

export function AdminLibraryPage() {
    const { t } = useTranslation();
    const [query, updateQuery] = useDataTableQuery<DataTableQuery>({
        orderBy: "title",
    });
    const router = useNavigation();

    const searchVariables: any = { ...query };
    const { data, loading, refetch } = useSearchLibraryCourses(searchVariables);

    useEffect(() => {
        refetch(searchVariables);
    }, [query]);

    // extract the course data
    const { items: courses = [], total = 0 } = data?.searchLibraryCourses || {};

    return (
        <AdminLayout selected="library">
            <Grid container direction="column" spacing={1}>
                <Grid item xs={12}>
                    <PageHeading title={t("admin:library")} />
                </Grid>
                {/* Courses */}
                <Grid item xs={12}>
                    <Paper>
                        <DataTable
                            hideEmptyRows
                            selectable={false}
                            onRowClick={(entry) =>
                                router.push(`/course/${entry.id}`)
                            }
                            columns={[
                                {
                                    headerName: t("title"),
                                    field: "title",
                                    sorting: true,
                                    render: function render(course) {
                                        return (
                                            <>
                                                {course.title}
                                                {course.demo && (
                                                    <Chip
                                                        size="small"
                                                        label={t("course:demo")}
                                                        color="secondary"
                                                        style={{
                                                            cursor: "pointer",
                                                            marginLeft: 8,
                                                        }}
                                                    />
                                                )}
                                            </>
                                        );
                                    },
                                },
                                {
                                    headerName: t("code"),
                                    field: "code",
                                    sorting: true,
                                },
                            ]}
                            rows={courses}
                            total={total}
                            loading={loading}
                            {...query}
                            updateQuery={updateQuery}
                        />
                    </Paper>
                </Grid>
            </Grid>
            <Box style={{ height: 100 }} />
        </AdminLayout>
    );
}
