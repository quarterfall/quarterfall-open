import Add from "@mui/icons-material/Add";
import SecurityIcon from "@mui/icons-material/Security";
import { Box, Button, Chip, Grid, Paper } from "@mui/material";
import { DataTable } from "components/dataview/datatable/DataTable";
import {
    DataTableQuery,
    useDataTableQuery,
} from "components/dataview/datatable/DataTableQuery";
import { useAuthContext } from "context/AuthProvider";
import { format } from "date-fns";
import { useToast } from "hooks/useToast";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LabeledSwitch } from "ui/form/inputs/LabeledSwitch";
import { useDateLocale } from "ui/hooks/DateLocale";
import { PageHeading } from "ui/PageHeading";
import { useNavigation } from "ui/route/Navigation";
import { useSearchOrganizations } from "../../features/admin/api/Admin.data";
import { AdminLayout } from "../../features/admin/layout/AdminLayout";
import { CreateOrganizationDialog } from "../../features/admin/organization/CreateOrganizationDialog";

interface Query extends DataTableQuery {
    showArchived: boolean;
}

export function AdminOrganizationsPage() {
    const { t } = useTranslation();
    const [query, updateQuery] = useDataTableQuery<Query>({
        orderBy: "name",
        showArchived: false,
    });
    const router = useNavigation();
    const { locale } = useDateLocale();
    const { loginAsUser } = useAuthContext();
    const [createOrganizationOpen, setCreateOrganizationOpen] = useState(false);
    const { showSuccessToast, showErrorToast } = useToast();

    const searchVariables: any = { ...query };

    const { data, loading, refetch } = useSearchOrganizations(searchVariables);

    useEffect(() => {
        refetch(searchVariables);
    }, [query]);

    const handleCompleteCreateOrganization = () => {
        showSuccessToast(t("organization:createComplete"));
    };
    const handleCreateOrganizationError = () => {
        showErrorToast(t("unknownError"));
    };

    // extract the organization data
    const { items: organizations = [], total = 0 } =
        data?.searchOrganizations || {};

    return (
        <AdminLayout selected="general">
            <Grid container direction="column" spacing={1}>
                <Grid item xs={12}>
                    <PageHeading title={t("organizations")} />
                </Grid>

                <Grid item xs={12}>
                    <LabeledSwitch
                        label={t("organization:showArchived")}
                        checked={query.showArchived}
                        onChange={(_, checked) =>
                            updateQuery({ showArchived: checked })
                        }
                    />
                </Grid>

                {/* Organizations */}
                <Grid item xs={12}>
                    <Paper>
                        <DataTable
                            hideEmptyRows
                            selectable={false}
                            onRowClick={(entry) =>
                                router.push(`/admin/organization/${entry.id}`)
                            }
                            columns={[
                                {
                                    headerName: t("organization:name"),
                                    field: "name",
                                    sorting: true,
                                    render: function render(rowData) {
                                        return (
                                            <>
                                                {rowData.name}
                                                {rowData.archived && (
                                                    <Chip
                                                        size="small"
                                                        label={t("archived")}
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
                                    headerName: t("createdAt"),
                                    field: "createdAt",
                                    sorting: true,
                                    render: function render(rowData) {
                                        return format(
                                            new Date(rowData.createdAt),
                                            "PPp",
                                            { locale }
                                        );
                                    },
                                },
                                {
                                    headerName: t("actions"),
                                    align: "right",
                                    sorting: false,
                                    render: function render(rowData) {
                                        return rowData.admins ? (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<SecurityIcon />}
                                                onClick={() =>
                                                    loginAsUser(
                                                        rowData.admins[0]
                                                            .emailAddress,
                                                        true
                                                    )
                                                }
                                            >
                                                {t("auth:login")}
                                            </Button>
                                        ) : null;
                                    },
                                },
                            ]}
                            rows={organizations}
                            total={total}
                            loading={loading}
                            {...query}
                            updateQuery={updateQuery}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Button
                        color="primary"
                        variant="contained"
                        size="large"
                        startIcon={<Add />}
                        onClick={() => setCreateOrganizationOpen(true)}
                    >
                        {t("organization:create")}
                    </Button>
                </Grid>
            </Grid>
            <Box style={{ height: 100 }} />
            <CreateOrganizationDialog
                open={createOrganizationOpen}
                onClose={() => setCreateOrganizationOpen(false)}
                onComplete={handleCompleteCreateOrganization}
                onError={handleCreateOrganizationError}
            />
        </AdminLayout>
    );
}
