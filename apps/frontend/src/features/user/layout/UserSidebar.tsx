import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DevicesIcon from "@mui/icons-material/Devices";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import {
    Box,
    darken,
    Divider,
    lighten,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
} from "@mui/material";
import { useAuthContext } from "context/AuthProvider";
import { ellipsis } from "core";
import { UserAvatar } from "features/user/UserAvatar";
import { useTranslation } from "react-i18next";
import { useNavigation } from "ui/route/Navigation";

export type UserSidebarItem = "general" | "interface" | "notifications";

export interface UserSidebarProps {
    selected?: UserSidebarItem;
}

export function UserSidebar(props: UserSidebarProps) {
    const { selected } = props;
    const { t } = useTranslation();
    const router = useNavigation();
    const { me } = useAuthContext();

    return (
        <>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                pt={2}
                pb={2}
                sx={(theme) => ({
                    backgroundColor:
                        theme.palette.mode === "light"
                            ? darken(theme.palette.background.paper, 0.05)
                            : lighten(theme.palette.background.paper, 0.05),
                })}
            >
                <UserAvatar user={me} sx={{ marginBottom: 1 }} />
                {me?.firstName && me?.lastName && (
                    <Typography>
                        <b>
                            {ellipsis(`${me?.firstName} ${me?.lastName}`, 30)}
                        </b>
                    </Typography>
                )}
                <Typography
                    variant="caption"
                    color="textSecondary"
                    gutterBottom
                >
                    {ellipsis(me?.emailAddress || "", 30)}
                </Typography>
                {me?.organizationRole && (
                    <Typography variant="body2" color="textSecondary">
                        {t(`roles:${me.organizationRole}`)}
                    </Typography>
                )}
            </Box>

            <Divider />

            <List style={{ padding: 0 }}>
                <ListItem button onClick={() => router.push("/")}>
                    <ListItemIcon>
                        <ChevronLeftIcon />
                    </ListItemIcon>
                    <ListItemText
                        disableTypography
                        primary={
                            <Typography variant="button">
                                {t("home")}
                            </Typography>
                        }
                    />
                </ListItem>
                <Divider />

                <ListItem
                    button
                    selected={selected === "general"}
                    onClick={() => router.push("/user")}
                >
                    <ListItemIcon>
                        <PersonIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("general")} />
                </ListItem>
                <ListItem
                    button
                    selected={selected === "interface"}
                    onClick={() => router.push("/user/interface")}
                >
                    <ListItemIcon>
                        <DevicesIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("user:interfaceSettings")} />
                </ListItem>
                <ListItem
                    button
                    selected={selected === "notifications"}
                    onClick={() => router.push("/user/notifications")}
                >
                    <ListItemIcon>
                        <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("user:notifications")} />
                </ListItem>
            </List>
        </>
    );
}
