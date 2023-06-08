import DeleteIcon from "@mui/icons-material/Delete";
import { Button, Grid, Paper, Skeleton } from "@mui/material";
import { DataTable } from "components/dataview/datatable/DataTable";
import { useDataTableQuery } from "components/dataview/datatable/DataTableQuery";
import { SortingOrder } from "core";
import { formatRelative } from "date-fns";
import { UserLayout } from "features/user/layout/UserLayout";
import {
    useDeleteNotifications,
    useSearchNotifications,
} from "features/user/Notifications.data";
import { UserAvatar } from "features/user/UserAvatar";
import { useToast } from "hooks/useToast";
import { Notification } from "interface/Notification.interface";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { useDateLocale } from "ui/hooks/DateLocale";
import { PageHeading } from "ui/PageHeading";
import { useNavigation } from "ui/route/Navigation";
export function UserNotificationsPage() {
    const { t } = useTranslation();
    const { locale } = useDateLocale();
    const [query, updateQuery] = useDataTableQuery({
        orderBy: "createdAt",
        order: SortingOrder.desc,
    });
    const { data, loading, refetch } = useSearchNotifications(query);
    const [selectedNotifications, setSelectedNotifications] = useState<
        string[]
    >([]);
    const [deleteNotificationsDialogOpen, setDeleteNotificationsDialogOpen] =
        useState(false);
    const [
        deleteAllNotificationsDialogOpen,
        setDeleteAllNotificationsDialogOpen,
    ] = useState(false);
    const [deleteNotificationsMutation] = useDeleteNotifications();
    const { showSuccessToast } = useToast();
    const router = useNavigation();

    // refetch when the parameters change
    useEffect(() => {
        refetch(query);
    }, [query]);

    const handleDeleteNotifications = async () => {
        await deleteNotificationsMutation({
            variables: {
                ids: selectedNotifications,
            },
        });
        setDeleteNotificationsDialogOpen(false);
        updateQuery({
            page: 1,
        });
        showSuccessToast(
            t("notifications:deletedToast", {
                count: selectedNotifications.length,
            })
        );
        setSelectedNotifications([]);
    };

    const handleDeleteAllNotifications = async () => {
        await deleteNotificationsMutation();
        setDeleteAllNotificationsDialogOpen(false);
        updateQuery({
            page: 1,
        });
        setSelectedNotifications([]);
        showSuccessToast(t("notifications:deletedAllToast"));
    };

    const handleRowClick = (entry: Notification, index: number) => {
        if (entry.link) {
            router.push(entry.link);
        }
    };

    // extract the data
    const notifications = data?.searchNotifications?.notifications || [];
    const total = data?.searchNotifications?.total || 0;

    return (
        <UserLayout selected="notifications">
            <Grid container direction="column" spacing={1}>
                <Grid item xs={12}>
                    <PageHeading title={t("notifications")} />
                </Grid>
                <Grid item>
                    <Paper>
                        <DataTable
                            emptyText={t("notifications:empty")}
                            hideEmptyRows
                            hideSearch
                            columns={[
                                {
                                    field: "avatar",
                                    sorting: false,
                                    renderPlaceHolder:
                                        function renderPlaceHolder() {
                                            return (
                                                <Skeleton
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                    }}
                                                    variant="circular"
                                                />
                                            );
                                        },
                                    render: function render(entry) {
                                        return (
                                            <UserAvatar user={entry.actor} />
                                        );
                                    },
                                },
                                {
                                    headerName: t("date"),
                                    field: "createdAt",
                                    sorting: true,
                                    render: function render(entry) {
                                        return formatRelative(
                                            new Date(entry.createdAt),
                                            new Date(),
                                            { locale }
                                        );
                                    },
                                },
                                {
                                    headerName: t("text"),
                                    field: "text",
                                    sorting: false,
                                    render: function render(entry) {
                                        return (
                                            entry.text ||
                                            t(
                                                `notifications:${entry.type}`,
                                                entry.metadata
                                            )
                                        );
                                    },
                                },
                            ]}
                            rows={notifications}
                            selectedRows={selectedNotifications}
                            total={total}
                            loading={loading}
                            onChangeSelectedRows={setSelectedNotifications}
                            onDeleteRows={() =>
                                setDeleteNotificationsDialogOpen(true)
                            }
                            onRowClick={handleRowClick}
                            {...query}
                            updateQuery={updateQuery}
                        />
                    </Paper>
                </Grid>
                {notifications.length > 0 && (
                    <Grid item>
                        <Button
                            color="primary"
                            variant="contained"
                            startIcon={<DeleteIcon />}
                            onClick={() =>
                                setDeleteAllNotificationsDialogOpen(true)
                            }
                        >
                            {t("notifications:deleteAll")}
                        </Button>
                    </Grid>
                )}
            </Grid>

            {/* Delete notifications confirmation dialog */}
            <ConfirmationDialog
                open={deleteNotificationsDialogOpen}
                title={t("notifications:confirmDeleteTitle")}
                message={t("notifications:confirmDeleteBody", {
                    count: selectedNotifications.length,
                })}
                onContinue={handleDeleteNotifications}
                onCancel={() => {
                    setDeleteNotificationsDialogOpen(false);
                }}
            />

            {/* Delete all notifications confirmation dialog */}
            <ConfirmationDialog
                open={deleteAllNotificationsDialogOpen}
                title={t("notifications:confirmDeleteAllTitle")}
                message={t("notifications:confirmDeleteAllBody", {
                    count: selectedNotifications.length,
                })}
                onContinue={handleDeleteAllNotifications}
                onCancel={() => {
                    setDeleteAllNotificationsDialogOpen(false);
                }}
            />
        </UserLayout>
    );
}
