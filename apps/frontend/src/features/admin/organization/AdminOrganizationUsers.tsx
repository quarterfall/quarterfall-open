import LockIcon from "@mui/icons-material/Lock";
import SecurityIcon from "@mui/icons-material/Security";
import { Button, Grid, Paper, Stack } from "@mui/material";
import { DataTable } from "components/dataview/datatable/DataTable";
import {
    DataTableQuery,
    useDataTableQuery,
} from "components/dataview/datatable/DataTableQuery";
import { useAuthContext } from "context/AuthProvider";
import { organizationRoles, RoleType } from "core";
import { UserRoleFilter } from "features/course/staff/users/UserRoleFilter";
import { useSearchOrganizationUsers } from "features/organization/api/OrganizationUsers.data";
import { Organization } from "interface/Organization.interface";
import { User } from "interface/User.interface";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FilterCard } from "ui/FilterCard";

interface Query extends DataTableQuery {
    hasRoleFilter: boolean;
    roles: RoleType[];
}

export interface AdminOrganizationAdminsProps {
    organization: Organization;
}

export function AdminOrganizationUsers(props: AdminOrganizationAdminsProps) {
    const { organization } = props;
    const { t } = useTranslation();
    const { loginAsUser } = useAuthContext();
    const [query, updateQuery] = useDataTableQuery<Query>({
        orderBy: "lastName",
        hasRoleFilter: false,
        roles: [],
    });

    const searchVariables: any = { ...query, id: organization.id };
    // remove roles if no role filter is active
    searchVariables.roles = query.hasRoleFilter
        ? searchVariables.roles
        : undefined;

    const {
        data: userData,
        loading: userLoading,
        refetch,
    } = useSearchOrganizationUsers(searchVariables);

    useEffect(() => {
        refetch(searchVariables);
    }, [query]);

    // extract the user data
    const users = userData?.searchOrganizationUsers?.users || [];
    const total = userData?.searchOrganizationUsers?.total || 0;

    // Role filter updating

    const onChangeSelectedRoles = (newSelectedRoles: RoleType[]) => {
        if (newSelectedRoles.length === organizationRoles.length) {
            updateQuery({
                roles: [],
                hasRoleFilter: false,
                page: 1,
            });
        } else {
            updateQuery({
                roles: newSelectedRoles,
                hasRoleFilter: true,
                page: 1,
            });
        }
    };

    const handleClickLoginAs = (user: User) => {
        // login as the user
        loginAsUser(user.emailAddress, true);
    };
    return (
        <Grid container>
            <Grid item xs={12}>
                <FilterCard>
                    <UserRoleFilter
                        onChangeSelectedRoles={onChangeSelectedRoles}
                        roles={organizationRoles}
                        selectedRoles={
                            query.hasRoleFilter
                                ? query.roles
                                : organizationRoles
                        }
                    />
                </FilterCard>
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
                                headerName: t("role"),
                                sorting: false,
                                render: function render(rowData) {
                                    return t(
                                        `roles:${rowData.organizationRole}`
                                    );
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
    );
}
