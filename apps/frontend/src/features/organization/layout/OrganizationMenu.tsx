import LicenseIcon from "@mui/icons-material/CardMembership";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import PeopleIcon from "@mui/icons-material/People";
import AnalyticsIcon from "@mui/icons-material/PieChart";
import SpellcheckIcon from "@mui/icons-material/Spellcheck";
import {
    Box,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
} from "@mui/material";
import { OrganizationIcon } from "components/icons";
import { useAuthContext } from "context/AuthProvider";
import { ellipsis, Permission } from "core";
import { usePermission } from "hooks/usePermission";
import { useTranslation } from "react-i18next";
import { useNavigation } from "ui/route/Navigation";

export type OrganizationMenuItem =
    | "general"
    | "users"
    | "grading"
    | "license"
    | "analytics-defaults";

export interface OrganizationMenuProps {
    selected?: OrganizationMenuItem;
}

export function OrganizationMenu(props: OrganizationMenuProps) {
    const { selected } = props;
    const router = useNavigation();
    const { me } = useAuthContext();
    const { t } = useTranslation();
    const can = usePermission();

    return (
        <>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                pt={2}
                pb={1}
                bgcolor="action.selected"
            >
                <OrganizationIcon />

                <Typography
                    variant="h6"
                    textAlign="center"
                    sx={{ wordBreak: "break-word" }}
                >
                    <b>{me?.organization?.name}</b>
                </Typography>
                <Typography
                    variant="caption"
                    color="textSecondary"
                    gutterBottom
                >
                    {ellipsis(me?.organization?.website || "", 40)}
                </Typography>
            </Box>

            <Divider />

            <List sx={{ padding: 0 }}>
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
                    onClick={() => router.push(`/organization`)}
                >
                    <ListItemIcon>
                        <OrganizationIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("general")} />
                </ListItem>
                <ListItem
                    button
                    selected={selected === "users"}
                    onClick={() => router.push(`/organization/users`)}
                >
                    <ListItemIcon>
                        <PeopleIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("users")} />
                </ListItem>
                <ListItem
                    button
                    selected={selected === "grading"}
                    onClick={() => router.push(`/organization/grading`)}
                >
                    <ListItemIcon>
                        <SpellcheckIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("gradingSchemes")} />
                </ListItem>
                <ListItem
                    button
                    selected={selected === "analytics-defaults"}
                    onClick={() =>
                        router.push(`/organization/analytics/defaults`)
                    }
                >
                    <ListItemIcon>
                        <AnalyticsIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={t("analytics:organizationDefaults")}
                    />
                </ListItem>
                {(can(Permission.readOrganizationLicense) ||
                    me?.isSysAdmin) && (
                    <ListItem
                        button
                        selected={selected === "license"}
                        onClick={() => router.push(`/organization/license`)}
                    >
                        <ListItemIcon>
                            <LicenseIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("organization:license")} />
                    </ListItem>
                )}
            </List>
        </>
    );
}
