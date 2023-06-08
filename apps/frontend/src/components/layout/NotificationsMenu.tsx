import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import {
    Badge,
    Box,
    Button,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Menu,
    MenuItem,
    Theme,
    Tooltip,
} from "@mui/material";
import { formatRelative } from "date-fns";
import { UserAvatar } from "features/user/UserAvatar";
import { Notification } from "interface/Notification.interface";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDateLocale } from "ui/hooks/DateLocale";
import { useNavigation } from "ui/route/Navigation";
import {
    useNotifications,
    useReadAllNotifications,
} from "./Notifications.data";

const notificationMenuSx = (theme: Theme) => ({
    [theme.breakpoints.up("sm")]: {
        width: "400px",
    },
});

const textSx = { overflow: "hidden", textOverflow: "ellipsis" };

export function NotificationsMenu() {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [readAllNotificationsMutation] = useReadAllNotifications();
    const router = useNavigation();
    const { data, loading } = useNotifications();
    const { locale } = useDateLocale();

    useEffect(() => {
        if (anchorEl !== null && unread > 0) {
            setTimeout(() => readAllNotificationsMutation(), 2000);
        }
    }, [anchorEl]);

    if (!data || loading) {
        return null;
    }

    const notifications = data?.me?.notifications || [];
    const unread = data?.me?.unreadNotifications || 0;
    const hasNotifications = notifications.length > 0;

    const openNotifications = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const closeNotifications = () => {
        setAnchorEl(null);
    };

    const goToNotifications = () => {
        setAnchorEl(null);
        router.push("/user/notifications");
    };

    const handleClick = (notification: Notification) => {
        setAnchorEl(null);
        router.push(notification.link || "/user/notifications");
    };

    const renderNotification = (notification: Notification) => {
        const text =
            notification.text ||
            t(`notifications:${notification.type}`, notification.metadata);
        const dateText = formatRelative(
            new Date(notification.createdAt),
            new Date(),
            { locale }
        );
        return (
            <MenuItem
                key={`notification_${notification.id}`}
                onClick={() => handleClick(notification)}
            >
                <ListItemIcon
                    sx={{
                        paddingRight: (theme) => theme.spacing(2),
                    }}
                >
                    <UserAvatar user={notification.actor} />
                </ListItemIcon>
                <ListItemText
                    sx={{ padding: 0 }}
                    primary={notification.read ? text : <b>{text}</b>}
                    primaryTypographyProps={{
                        sx: textSx,
                    }}
                    secondary={notification.read ? dateText : <b>{dateText}</b>}
                    secondaryTypographyProps={{
                        sx: textSx,
                    }}
                />
            </MenuItem>
        );
    };

    return (
        <>
            {/* Button */}
            <Tooltip title={t("notifications")!}>
                <IconButton
                    color="inherit"
                    onClick={openNotifications}
                    size="large"
                >
                    <Badge
                        invisible={unread === 0}
                        badgeContent={unread > 99 ? "99+" : unread}
                        color="secondary"
                    >
                        {hasNotifications ? (
                            <NotificationsIcon />
                        ) : (
                            <NotificationsNoneIcon />
                        )}
                    </Badge>
                </IconButton>
            </Tooltip>
            {/* Notification list */}
            <Menu
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                disableRestoreFocus
                onClose={closeNotifications}
                MenuListProps={{
                    sx: notificationMenuSx,
                    subheader: (
                        <ListSubheader>{t("notifications")}</ListSubheader>
                    ),
                }}
            >
                {!hasNotifications && (
                    <ListItem disabled>
                        <ListItemText primary={t("notifications:empty")} />
                    </ListItem>
                )}
                {notifications.map((notification) =>
                    renderNotification(notification)
                )}

                <Box sx={{ textAlign: "right", paddingRight: 1 }}>
                    {hasNotifications && (
                        <Button
                            size="small"
                            color="primary"
                            sx={{ marginLeft: 1 }}
                            onClick={goToNotifications}
                        >
                            {t("showAll")}
                        </Button>
                    )}
                </Box>
            </Menu>
        </>
    );
}
