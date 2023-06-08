import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import PieChartIcon from "@mui/icons-material/PieChart";
import SecurityIcon from "@mui/icons-material/Security";
import LibraryIcon from "@mui/icons-material/Storefront";
import {
    Avatar,
    Box,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
} from "@mui/material";
import { useAuthContext } from "context/AuthProvider";
import { ellipsis } from "core";
import { useTranslation } from "react-i18next";
import { useNavigation } from "ui/route/Navigation";

export type AdminMenuItem =
    | "general"
    | "analytics-presets"
    | "users"
    | "library";

export interface AdminMenuProps {
    selected?: AdminMenuItem;
}

export function AdminMenu(props: AdminMenuProps) {
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
                sx={{
                    paddingTop: (theme) => theme.spacing(2),
                    paddingBottom: (theme) => theme.spacing(1),
                }}
            >
                <Avatar
                    sx={{
                        marginBottom: (theme) => theme.spacing(1),
                        color: (theme) => theme.palette.text.primary,
                        backgroundColor: (theme) =>
                            theme.palette.secondary.main,
                    }}
                >
                    <SecurityIcon />
                </Avatar>
                <Typography>
                    <b>{t("admin:systemAdministration")}</b>
                </Typography>
                <Typography
                    variant="caption"
                    color="textSecondary"
                    gutterBottom
                >
                    {ellipsis(`${me?.firstName} ${me?.lastName}`, 30)}
                </Typography>
            </Box>

            <Divider />

            <List>
                <ListItem
                    button
                    selected={selected === "general"}
                    onClick={() => router.push("/admin")}
                >
                    <ListItemIcon>
                        <HomeIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("general")} />
                </ListItem>
                <ListItem
                    button
                    selected={selected === "library"}
                    onClick={() => router.push("/admin/library")}
                >
                    <ListItemIcon>
                        <LibraryIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("admin:library")} />
                </ListItem>
                <ListItem
                    button
                    selected={selected === "users"}
                    onClick={() => router.push("/admin/users")}
                >
                    <ListItemIcon>
                        <PersonIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("admin:users")} />
                </ListItem>
                <ListItem
                    button
                    selected={selected === "analytics-presets"}
                    onClick={() => router.push("/admin/analytics-presets")}
                >
                    <ListItemIcon>
                        <PieChartIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("admin:analyticsPresets")} />
                </ListItem>
            </List>
        </>
    );
}
