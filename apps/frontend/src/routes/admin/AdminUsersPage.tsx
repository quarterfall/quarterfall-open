import LockIcon from "@mui/icons-material/Lock";
import SecurityIcon from "@mui/icons-material/Security";
import { Button, Grid, Paper, Stack } from "@mui/material";
import { DataTable } from "components/dataview/datatable/DataTable";
import {
    DataTableQuery,
    useDataTableQuery,
} from "components/dataview/datatable/DataTableQuery";
import { useAuthContext } from "context/AuthProvider";
import { useSearchAllUsers } from "features/admin/api/Admin.data";
import { AdminLayout } from "features/admin/layout/AdminLayout";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "ui/Link";
import { PageHeading } from "ui/PageHeading";

export function AdminUsersPage() {
    const { t } = useTranslation();
    const { loginAsUser } = useAuthContext();
    const [query, updateQuery] = useDataTableQuery<DataTableQuery>({
        orderBy: "lastName",
    });

    const {
        data: userData,
        loading: userLoading,
        refetch,
    } = useSearchAllUsers(query);

    useEffect(() => {
        refetch(query);
    }, [query]);

    // extract the user data
    const users = userData?.searchAllUsers?.items || [];
    const total = userData?.searchAllUsers?.total || 0;

    return (
        <AdminLayout selected="users">
            <Grid container direction="column" spacing={1}>
                <Grid item xs={12}>
                    <PageHeading title={t("users")} />
                </Grid>
                {/* Users */}
                <Grid item xs={12}>
                    <Paper>
                        <DataTable
                            hideEmptyRows
                            columns={[
                                {
                                    headerName: t("user:firstName"),
                                    field: "firstName",
                                    sorting: true,
                                },
                                {
                                    headerName: t("user:lastName"),
                                    field: "lastName",
                                    sorting: true,
                                },
                                {
                                    headerName: t("emailAddress"),
                                    field: "emailAddress",
                                    sorting: true,
                                },
                                {
                                    headerName: t("organization"),
                                    sorting: false,
                                    render: function render(rowData) {
                                        const organizations =
                                            rowData.organizations || [];
                                        return organizations.map((o) => (
                                            <Link
                                                variant="body2"
                                                to={`/admin/organization/${o.id}`}
                                                key={`organization_${o.id}`}
                                            >
                                                {o.name}
                                            </Link>
                                        ));
                                    },
                                },
                                {
                                    headerName: t("actions"),
                                    align: "right",
                                    sorting: false,
                                    render: function render(rowData) {
                                        return (
                                            <Stack
                                                direction="row"
                                                justifyContent="flex-end"
                                                spacing={1}
                                            >
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<SecurityIcon />}
                                                    onClick={() =>
                                                        loginAsUser(
                                                            rowData.emailAddress,
                                                            true
                                                        )
                                                    }
                                                >
                                                    {t("auth:login")}
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<LockIcon />}
                                                    onClick={() =>
                                                        loginAsUser(
                                                            rowData.emailAddress,
                                                            false
                                                        )
                                                    }
                                                >
                                                    {t("auth:login")}
                                                </Button>
                                            </Stack>
                                        );
                                    },
                                },
                            ]}
                            rows={users}
                            total={total}
                            loading={userLoading}
                            {...query}
                            updateQuery={updateQuery}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </AdminLayout>
    );
}
