import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { Button, Grid, IconButton, Paper, Tooltip } from "@mui/material";
import { DataTable } from "components/dataview/datatable/DataTable";
import {
    DataTableQuery,
    useDataTableQuery,
} from "components/dataview/datatable/DataTableQuery";
import {
    hasErrorCode,
    organizationRoles,
    Permission,
    RoleType,
    ServerError,
} from "core";
import { UserRoleFilter } from "features/course/staff/users/UserRoleFilter";
import {
    useRemoveOrganizationUsers,
    useSearchOrganizationUsers,
} from "features/organization/api/OrganizationUsers.data";
import { OrganizationLayout } from "features/organization/layout/OrganizationLayout";
import { AddOrganizationUsersDialog } from "features/organization/users/AddOrganizationUsersDialog";
import { EditOrganizationUserDialog } from "features/organization/users/EditOrganizationUserDialog";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { User } from "interface/User.interface";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { FilterCard } from "ui/FilterCard";
import { PageHeading } from "ui/PageHeading";
interface Query extends DataTableQuery {
    hasRoleFilter: boolean;
    roles: RoleType[];
}

export function OrganizationUsersPage() {
    const { t } = useTranslation();
    const [query, updateQuery] = useDataTableQuery<Query>({
        orderBy: "lastName",
        hasRoleFilter: false,
        roles: [],
    });

    const searchVariables: any = { ...query };
    // remove roles if no role filter is active
    searchVariables.roles = query.hasRoleFilter
        ? searchVariables.roles
        : undefined;

    const {
        data: userData,
        loading: userLoading,
        refetch,
    } = useSearchOrganizationUsers(searchVariables);
    const [editUser, setEditUser] = useState<User | undefined>(undefined);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [addUsersDialogOpen, setAddUsersDialogOpen] = useState(false);
    const [removeUsersDialogOpen, setRemoveUsersDialogOpen] = useState(false);
    const [removeOrganizationUsersMutation] = useRemoveOrganizationUsers();
    const can = usePermission();
    const { showSuccessToast, showErrorToast } = useToast();

    useEffect(() => {
        refetch(searchVariables);
    }, [query]);

    // extract the user data
    const users = userData?.searchOrganizationUsers?.users || [];
    const total = userData?.searchOrganizationUsers?.total || 0;

    const selectedUserNames = selectedUsers.map((id) => {
        const user = users.find((s) => s.id === id);
        return user ? `${user.firstName} ${user.lastName}` : "";
    });

    const handleRemoveOrganizationUsers = async () => {
        try {
            await removeOrganizationUsersMutation({
                variables: {
                    users: selectedUsers,
                },
            });
            showSuccessToast(
                t("organization:confirmUsersRemoved", {
                    count: selectedUsers.length,
                })
            );
        } catch (error) {
            if (hasErrorCode(error, ServerError.AtLeastOneAdminError)) {
                showSuccessToast(t("organization:atLeastOneAdminError"));
            } else {
                showErrorToast(t("unknownError"));
            }
        }
        setRemoveUsersDialogOpen(false);
        setSelectedUsers([]);
        updateQuery({
            page: 1,
        });
    };

    const handleAddOrganizationUsers = () => {
        showSuccessToast(t("organization:confirmUsersAdded"));
        setAddUsersDialogOpen(false);
        setSelectedUsers([]);
        updateQuery({
            page: 1,
        });
    };

    const handleAddOrganizationUsersError = (error) => {
        showErrorToast(t("unknownError"));

        setAddUsersDialogOpen(false);
        setSelectedUsers([]);
        updateQuery({
            page: 1,
        });
    };

    const handleEditOrganizationUser = () => {
        showSuccessToast();
        setEditUser(undefined);
        updateQuery({
            page: 1,
        });
    };

    const handleEditOrganizationUserError = (error) => {
        if (hasErrorCode(error, ServerError.AtLeastOneAdminError)) {
            showErrorToast(t("organization:atLeastOneAdminError"));
        } else if (hasErrorCode(error, ServerError.EmailAddressAlreadyExists)) {
            showErrorToast(t("auth:errorEmailAddressAlreadyExists"));
        } else {
            showErrorToast(t("unknownError"));
        }
        setEditUser(undefined);
        updateQuery({
            page: 1,
        });
    };

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

    // verify that the user is allowed to see this page
    if (!can(Permission.updateOrganization)) {
        return <AccessErrorPage />;
    }

    return (
        <OrganizationLayout selected="users">
            <Grid container direction="column" spacing={1}>
                <Grid item xs={12}>
                    <PageHeading title={t("users")} />
                </Grid>
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
                                            <>
                                                <Tooltip title={t("edit")!}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                            setEditUser(rowData)
                                                        }
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        );
                                    },
                                },
                            ]}
                            rows={users}
                            selectedRows={selectedUsers}
                            total={total}
                            loading={userLoading}
                            onChangeSelectedRows={setSelectedUsers}
                            onDeleteRows={() => setRemoveUsersDialogOpen(true)}
                            {...query}
                            updateQuery={updateQuery}
                        />
                    </Paper>
                </Grid>

                <Grid item>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<AddIcon />}
                        onClick={() => setAddUsersDialogOpen(true)}
                    >
                        {t("organization:addUsers")}
                    </Button>
                </Grid>
            </Grid>

            <AddOrganizationUsersDialog
                open={addUsersDialogOpen}
                onComplete={handleAddOrganizationUsers}
                onError={handleAddOrganizationUsersError}
                onClose={() => setAddUsersDialogOpen(false)}
            />

            {/* Remove users confirmation dialog */}
            <ConfirmationDialog
                open={removeUsersDialogOpen}
                title={t("organization:confirmRemoveUsersTitle")}
                message={t("organization:confirmRemoveUsersBody", {
                    count: selectedUsers.length,
                    name: selectedUserNames[0],
                })}
                onContinue={handleRemoveOrganizationUsers}
                onCancel={() => {
                    setRemoveUsersDialogOpen(false);
                }}
            />

            {/* Edit organization user role dialog */}
            <EditOrganizationUserDialog
                user={editUser}
                onComplete={handleEditOrganizationUser}
                onError={handleEditOrganizationUserError}
                onClose={() => setEditUser(undefined)}
            />
        </OrganizationLayout>
    );
}
