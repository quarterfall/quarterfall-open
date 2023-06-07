import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import UnapproveIcon from "@mui/icons-material/UnpublishedOutlined";
import { Chip, IconButton, Paper, Tooltip } from "@mui/material";
import {
    DataTable,
    DataTableProps,
} from "components/dataview/datatable/DataTable";
import { ellipsis } from "core";
import { format } from "date-fns";
import { ReopenSubmissionDialog } from "features/submission/ReopenSubmissionDialog";
import {
    useDeleteSubmissions,
    useUnapproveSubmissions,
} from "features/submission/Submission.data";
import { UserAvatar } from "features/user/UserAvatar";
import { useToast } from "hooks/useToast";
import { Submission } from "interface/Submission.interface";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { useDateLocale } from "ui/hooks/DateLocale";
import { useNavigation } from "ui/route/Navigation";
export interface SubmissionTableEntry extends Submission {
    firstName: string;
    lastName: string;
    avatarName: string;
    avatarImageSmall: string;
    assignmentTitle: string;
    moduleTitle: string;
    submittedDateStr: string;
}

export interface SubmissionsTableProps
    extends Pick<
        DataTableProps<SubmissionTableEntry>,
        Exclude<keyof DataTableProps<SubmissionTableEntry>, "columns">
    > {
    submissions: Submission[];
    hasGrading?: boolean;
    showModuleName?: boolean;
    showAssignmentName?: boolean;
    hideUserInfo?: boolean;
}

export type Align = "center" | "inherit" | "right" | "left" | "justify";

export const SubmissionsTable = memo((props: SubmissionsTableProps) => {
    const {
        submissions = [],
        selectable,
        rows: oldEntries,
        hasGrading,
        updateQuery,
        showAssignmentName = false,
        showModuleName = false,
        hideUserInfo = false,
        ...rest
    } = props;
    const { t } = useTranslation();
    const router = useNavigation();
    const { locale } = useDateLocale();
    const [deleteSubmissionsMutation] = useDeleteSubmissions();
    const [unapproveSubmissionsMutation] = useUnapproveSubmissions();

    const { showSuccessToast } = useToast();

    const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>(
        []
    );
    const [removeSubmissionsDialogOpen, setRemoveSubmissionsDialogOpen] =
        useState(false);
    const [reopenSubmissionDialogOpen, setReopenSubmissionDialogOpen] =
        useState(false);

    const [unapproveDialogOpen, setUnapproveDialogOpen] = useState(false);

    // compute the submissions data
    const entries: SubmissionTableEntry[] = submissions.map((item) => ({
        ...item,
        firstName: item.student?.firstName,
        lastName: item.student?.lastName,
        emailAddress: item.student?.emailAddress,
        avatarName: item.student?.avatarName,
        avatarImageSmall: item.student?.avatarImageSmall,
        submittedDateStr: format(new Date(item.submittedDate), "PPp", {
            locale,
        }),
        assignmentTitle: item.assignment?.title,
        moduleTitle: item.assignment?.module?.title,
        isTeacherTest: item.isTeacherTest,
    }));

    const handleRemoveSubmissions = async () => {
        await deleteSubmissionsMutation({
            variables: {
                submissionIds: selectedSubmissions,
            },
        });
        showSuccessToast(t("submission:deletedNotification"));
        setRemoveSubmissionsDialogOpen(false);
        setSelectedSubmissions([]);
        updateQuery({
            page: 1,
        });
    };

    const handleClickApprove = async () => {
        await unapproveSubmissionsMutation({
            variables: {
                submissionIds: selectedSubmissions,
            },
        });
        showSuccessToast();
    };

    return (
        <Paper>
            <DataTable
                columns={[
                    !hideUserInfo && {
                        headerName: t("user:avatar"),
                        field: "avatar",
                        sorting: false,
                        render: function render(rowData) {
                            return (
                                <UserAvatar
                                    user={rowData.student}
                                    sx={{
                                        width: "40px",
                                    }}
                                />
                            );
                        },
                    },
                    !hideUserInfo && {
                        headerName: t("user:firstName"),
                        field: "firstName",
                        sorting: true,
                    },
                    !hideUserInfo && {
                        headerName: t("user:lastName"),
                        field: "lastName",
                        sorting: true,
                    },
                    !hideUserInfo && {
                        headerName: t("user:emailAddress"),
                        field: "emailAddress",
                    },
                    {
                        headerName: t("submission:submittedDate"),
                        field: "submittedDate",
                        render: function render(rowData) {
                            return rowData.submittedDateStr;
                        },
                        sorting: true,
                    },
                    showAssignmentName && {
                        headerName: t("assignment"),
                        field: "assignmentTitle",
                        render: function render(rowData) {
                            return ellipsis(rowData.assignmentTitle, 40);
                        },
                        sorting: true,
                    },
                    showModuleName && {
                        headerName: t("module"),
                        field: "moduleTitle",
                        render: function render(rowData) {
                            return ellipsis(rowData.moduleTitle, 40);
                        },
                        sorting: true,
                    },
                    {
                        headerName: t("submission:score"),
                        field: "score",
                        sorting: true,
                        render: function render(rowData) {
                            return rowData?.score?.toString();
                        },
                    },
                    {
                        headerName: t("grade"),
                        field: "grade",
                        sorting: true,
                        render: function render(rowData) {
                            return rowData.isApproved && rowData.grade
                                ? rowData.grade
                                : undefined;
                        },
                    },
                    {
                        headerName: "",
                        field: "isTeacherTest",
                        align: "center" as Align,
                        render: function render(rowData) {
                            return rowData.isTeacherTest ? (
                                <Chip color="secondary" label={t("test")} />
                            ) : undefined;
                        },
                    },
                ].filter(Boolean)}
                selectable={selectable}
                rows={entries}
                hideEmptyRows
                onRowClick={(entry) => {
                    router.push(
                        hasGrading
                            ? `/grading/${entry.id}`
                            : `/submission/${entry.id}`
                    );
                }}
                selectedRows={selectedSubmissions}
                onChangeSelectedRows={setSelectedSubmissions}
                onDeleteRows={() => setRemoveSubmissionsDialogOpen(true)}
                updateQuery={updateQuery}
                toolbarSelectedComponents={(rows: Submission[]) => {
                    const allSubmissionsApproved =
                        rows.filter((r) => {
                            return (
                                selectedSubmissions.includes(r.id) &&
                                r.isApproved
                            );
                        }).length === selectedSubmissions.length;

                    return (
                        <>
                            {allSubmissionsApproved && (
                                <Tooltip title={t("submission:unapprove")!}>
                                    <IconButton
                                        aria-label="unapprove"
                                        onClick={() =>
                                            setUnapproveDialogOpen(true)
                                        }
                                        size="large"
                                    >
                                        <UnapproveIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                            <Tooltip title={t("submission:reopen")!}>
                                <IconButton
                                    aria-label="reopen"
                                    onClick={() =>
                                        setReopenSubmissionDialogOpen(true)
                                    }
                                    size="large"
                                >
                                    <AssignmentReturnIcon />
                                </IconButton>
                            </Tooltip>
                        </>
                    );
                }}
                {...rest}
            />
            <ConfirmationDialog
                open={removeSubmissionsDialogOpen}
                title={t("submission:confirmRemoveSubmissionsTitle")}
                message={t("submission:confirmRemoveSubmissionsMessage", {
                    count: selectedSubmissions.length,
                })}
                onContinue={handleRemoveSubmissions}
                onCancel={() => {
                    setRemoveSubmissionsDialogOpen(false);
                }}
            />
            <ReopenSubmissionDialog
                submissionIds={selectedSubmissions}
                open={reopenSubmissionDialogOpen}
                onClose={() => setReopenSubmissionDialogOpen(false)}
            />
            <ConfirmationDialog
                open={unapproveDialogOpen}
                title={t("submission:confirmUnapproveTitle")}
                message={t("submission:confirmUnapproveMessage")}
                onContinue={() => {
                    handleClickApprove();
                    setUnapproveDialogOpen(false);
                }}
                onCancel={() => setUnapproveDialogOpen(false)}
            />
        </Paper>
    );
});
