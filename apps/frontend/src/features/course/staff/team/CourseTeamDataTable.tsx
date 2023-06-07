import EditIcon from "@mui/icons-material/Edit";
import { Chip, IconButton, Tooltip } from "@mui/material";
import { DataTable } from "components/dataview/datatable/DataTable";
import {
    DataTableQuery,
    useDataTableQuery,
} from "components/dataview/datatable/DataTableQuery";
import {
    hasErrorCode,
    Permission,
    RoleType,
    ServerError,
    SortingOrder,
} from "core";
import { useRemoveCourseUsers } from "features/course/staff/users/api/CourseUsers.data";
import { EditUserRoleDialog } from "features/course/staff/users/EditUserRoleDialog";
import { useDataTableOperations } from "hooks/useDataTableOperations";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Course } from "interface/Course.interface";
import { User } from "interface/User.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { ToggleChip } from "ui/ToggleChip";

type Align = "center" | "inherit" | "right" | "left" | "justify";

interface UserTableEntry extends User {}

interface CourseUserQuery extends DataTableQuery {
    hideInvited?: boolean;
}

interface CourseTeamDataTableProps {
    course: Course;
    loading?: boolean;
    refetch?: () => void;
    selectedStaff?: string[];
    setSelectedStaff?: (_: string[]) => void;
}

export function CourseTeamDataTable(props: CourseTeamDataTableProps) {
    const { course, loading, refetch, selectedStaff, setSelectedStaff } = props;
    const { t } = useTranslation();
    const can = usePermission();
    const { showSuccessToast, showErrorToast } = useToast();

    const [query, updateQuery] = useDataTableQuery<CourseUserQuery>({
        orderBy: "firstName",
        order: SortingOrder.asc,
        hideInvited: true,
    });

    const handleFilterData = (user: User) =>
        `${user?.firstName} ${user?.lastName} ${user?.emailAddress}`
            .toLowerCase()
            .includes(query?.term?.toLowerCase());

    const handleToggleInvited = () =>
        updateQuery({
            hideInvited: !query.hideInvited,
        });

    const [filterData, sortData, paginateData] = useDataTableOperations<User>(
        query,
        handleFilterData
    );

    const [waiting, setWaiting] = useState(false);
    const [editUser, setEditUser] = useState<Partial<User> | undefined>(
        undefined
    );
    const [removeUsersDialogOpen, setRemoveUsersDialogOpen] = useState(false);

    const [removeCourseUsersMutation] = useRemoveCourseUsers();

    const staff = course?.staff.filter((s) => {
        if (!query.hideInvited) {
            return true;
        }
        return s.isActive;
    });

    const noOfInvitedStaff = course?.staff.filter((s) => !s.isActive).length;

    const selectedStaffNames = selectedStaff.map((id) => {
        const member = staff.find((s) => s.id === id);
        if (!member) {
            return "";
        }
        if (!(member?.firstName && member?.lastName)) {
            return `${member?.emailAddress}`;
        }
        return `${member?.firstName} ${member?.lastName}`;
    });

    const handleRemoveCourseUsers = async () => {
        setWaiting(true);
        try {
            await removeCourseUsersMutation({
                variables: {
                    id: course?.id,
                    users: selectedStaff,
                },
            });
            showSuccessToast(
                t("course:usersRemovedToast", { count: selectedStaff.length })
            );
        } catch (error) {
            if (hasErrorCode(error, ServerError.AtLeastOneAdminError)) {
                showErrorToast(t("course:atLeastOneAdminError"));
            } else {
                showErrorToast(t("unknownError"));
            }
        }
        setRemoveUsersDialogOpen(false);
        setSelectedStaff([]);
        refetch();
        setWaiting(false);
    };

    const canUpdateUsers = can(Permission.updateCourseUser, course);

    // compute the user data
    const filteredStaff = filterData(staff);
    const sortedStaff = sortData(filteredStaff);
    const paginatedStaff = paginateData(sortedStaff);

    const entries: UserTableEntry[] = paginatedStaff;
    const columns = [
        {
            field: "firstName",
            headerName: t("user:firstName"),
        },
        {
            field: "lastName",
            headerName: t("user:lastName"),
        },
        {
            field: "emailAddress",
            headerName: t("emailAddress"),
        },
        {
            headerName: "",
            field: "isActive",
            sorting: true,
            align: "right" as Align,
            render: function render(rowData: Partial<User>) {
                return rowData.isActive ? undefined : (
                    <Chip size="small" color="secondary" label={t("invited")} />
                );
            },
        },
        {
            field: "courseRole",
            align: "right" as Align,
            headerName: t("role"),
            render: (rowData: Partial<User>) => {
                return (
                    <>
                        {rowData?.courseRole &&
                            t(`roles:${rowData.courseRole}`)}
                        {rowData?.courseRole &&
                            rowData?.courseRole !== RoleType.courseStudent &&
                            canUpdateUsers && (
                                <Tooltip title={t("roles:edit")}>
                                    <IconButton
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setEditUser(rowData);
                                        }}
                                        size="small"
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                    </>
                );
            },
        },
    ];

    return (
        <>
            <DataTable
                rows={entries}
                columns={columns}
                selectable={!course?.archived && canUpdateUsers}
                onChangeSelectedRows={(newSelectedStaff) => {
                    setSelectedStaff(newSelectedStaff);
                }}
                toolbarUnselectedComponents={(rows: User[]) => {
                    return (
                        noOfInvitedStaff > 0 && (
                            <ToggleChip
                                size="small"
                                selected={!query.hideInvited}
                                label={t("user:showInvited")}
                                onClick={handleToggleInvited}
                                data-cy="showInvitedMembersChip"
                            />
                        )
                    );
                }}
                onRowClick={(newEntry) => {
                    if (course?.archived || !canUpdateUsers) {
                        return;
                    }
                    if (selectedStaff.includes(newEntry?.id)) {
                        setSelectedStaff(
                            selectedStaff.filter(
                                (value) => value !== newEntry?.id
                            )
                        );
                    } else {
                        setSelectedStaff(selectedStaff.concat(newEntry?.id));
                    }
                }}
                loading={loading}
                selectedRows={selectedStaff}
                onDeleteRows={() => setRemoveUsersDialogOpen(true)}
                hideEmptyRows
                total={entries?.length}
                {...query}
                updateQuery={updateQuery}
            />

            {/* Edit course user role dialog */}
            <EditUserRoleDialog
                course={course}
                user={editUser}
                onClose={() => setEditUser(undefined)}
            />

            {/* Remove users confirmation dialog */}
            <ConfirmationDialog
                open={removeUsersDialogOpen}
                title={t("course:confirmRemoveUsersTitle")}
                message={t("course:confirmRemoveUsersBody_one", {
                    name: selectedStaffNames[0],
                })}
                waiting={waiting}
                onContinue={handleRemoveCourseUsers}
                onCancel={() => {
                    setRemoveUsersDialogOpen(false);
                }}
            />
        </>
    );
}
