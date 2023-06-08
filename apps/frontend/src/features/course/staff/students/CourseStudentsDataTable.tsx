import { Chip } from "@mui/material";
import { DataTable } from "components/dataview/datatable/DataTable";
import {
    DataTableQuery,
    useDataTableQuery,
} from "components/dataview/datatable/DataTableQuery";
import { Permission, SortingOrder } from "core";
import { useRemoveCourseUsers } from "features/course/staff/users/api/CourseUsers.data";
import { useDataTableOperations } from "hooks/useDataTableOperations";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Course } from "interface/Course.interface";
import { User } from "interface/User.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { useNavigation } from "ui/route/Navigation";
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
    selectedStudents: string[];
    setSelectedStudents: (_: string[]) => void;
}

export function CourseStudentsDataTable(props: CourseTeamDataTableProps) {
    const { course, loading, refetch, selectedStudents, setSelectedStudents } =
        props;
    const { t } = useTranslation();
    const can = usePermission();

    const { showSuccessToast, showErrorToast } = useToast();
    const router = useNavigation();

    const [query, updateQuery] = useDataTableQuery<CourseUserQuery>({
        orderBy: "lastName",
        order: SortingOrder.asc,
        hideInvited: true,
    });

    const handleToggleInvited = () =>
        updateQuery({
            hideInvited: !query.hideInvited,
        });
    const handleFilterData = (user: User) =>
        `${user.firstName} ${user.lastName} ${user.emailAddress}`
            .toLowerCase()
            .includes(query.term.toLowerCase());

    const [filterData, sortData, paginateData] = useDataTableOperations<User>(
        query,
        handleFilterData
    );

    const [waiting, setWaiting] = useState(false);

    const [removeUsersDialogOpen, setRemoveUsersDialogOpen] = useState(false);
    const [removeCourseUsersMutation] = useRemoveCourseUsers();

    const students = course?.students.filter((s) => {
        if (!query.hideInvited) {
            return true;
        }
        return s.isActive;
    });

    const noOfInvitedStudents = course?.students.filter(
        (s) => !s.isActive
    ).length;

    const selectedUserNames = selectedStudents.map((id) => {
        const student = students.find((s) => s.id === id);
        if (!student) {
            return "";
        }
        if (!student.firstName && !student.lastName) {
            return student.emailAddress;
        } else {
            let name = `${student.firstName} ` || "";
            if (student.lastName) {
                name += student.lastName;
            }
            return name.trim();
        }
    });

    const handleRemoveCourseUsers = async () => {
        setWaiting(true);
        try {
            await removeCourseUsersMutation({
                variables: {
                    id: course.id,
                    users: selectedStudents,
                },
            });
            showSuccessToast(
                t("course:studentsRemovedToast", {
                    count: selectedStudents.length,
                })
            );
        } catch (error) {
            showErrorToast(t("unknownError"));
        }
        setRemoveUsersDialogOpen(false);
        setSelectedStudents([]);
        refetch();
        setWaiting(false);
    };

    const canUpdateUsers = can(Permission.updateCourseUser, course);

    const handleRowClick = (user: Partial<User>) =>
        router.push(`/course/${course?.id}/students/${user?.id}/analytics`);

    const filteredUsers = filterData(students);
    const sortedUsers = sortData(filteredUsers);
    const paginatedUsers = paginateData(sortedUsers);

    const entries: UserTableEntry[] = paginatedUsers;

    const columns = [
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
    ];

    return (
        <>
            <DataTable
                rows={entries}
                columns={columns}
                selectable={!course?.archived && canUpdateUsers}
                onChangeSelectedRows={(newSelectedStaff) => {
                    setSelectedStudents(newSelectedStaff);
                }}
                onRowClick={(entry) => {
                    handleRowClick(entry);
                }}
                toolbarUnselectedComponents={(rows: User[]) => {
                    return (
                        noOfInvitedStudents > 0 && (
                            <ToggleChip
                                size="small"
                                selected={!query.hideInvited}
                                label={t("user:showInvited")}
                                onClick={handleToggleInvited}
                                data-cy="showInvitedStudentsChip"
                            />
                        )
                    );
                }}
                selectedRows={selectedStudents}
                onDeleteRows={() => setRemoveUsersDialogOpen(true)}
                hideEmptyRows
                loading={loading}
                total={sortedUsers?.length}
                {...query}
                updateQuery={updateQuery}
            />

            {/* Remove users confirmation dialog */}
            <ConfirmationDialog
                open={removeUsersDialogOpen}
                title={t("course:confirmRemoveStudentsTitle")}
                message={t("course:confirmRemoveStudentsBody", {
                    count: selectedStudents.length,
                    name: selectedUserNames[0],
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
