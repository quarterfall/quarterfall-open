import AdminIcon from "@mui/icons-material/Build";
import CheckIcon from "@mui/icons-material/Check";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import BugReportIcon from "@mui/icons-material/BugReport";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PersonIcon from "@mui/icons-material/Person";
import {
    Box,
    Divider,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Typography,
} from "@mui/material";
import { OrganizationIcon } from "components/icons";
import { colors, config } from "config";
import { useAuthContext } from "context/AuthProvider";
import { Permission, RoleType } from "core";
import { UserAvatar } from "features/user/UserAvatar";
import { usePermission } from "hooks/usePermission";
import { Organization } from "interface/Organization.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { useNavigation } from "ui/route/Navigation";
import { useSwitchToOrganization } from "./Organization.data";

export function HeaderMenu() {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const { me, logout } = useAuthContext();
    const { t } = useTranslation();
    const isMenuOpen = Boolean(anchorEl);
    const can = usePermission();
    const [confirmLogoutDialogOpen, setConfirmLogoutDialogOpen] =
        useState(false);
    const router = useNavigation();
    const [switchToOrganizationMutation] = useSwitchToOrganization();

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleSwitchOrganization = async (org: Organization) => {
        setAnchorEl(null);
        if (org.id === me.organization?.id) {
            return;
        }
        await switchToOrganizationMutation({
            variables: { id: org.id },
        });
        window.location.href = window.location.origin;
    };

    const handleClickKnowledgeBase = () => {
        if (me?.organizationRole === RoleType.organizationStudent) {
            window.open("https://help.quarterfall.com/for-students");
        } else {
            window.open("https://help.quarterfall.com");
        }
        setAnchorEl(null);
    };

    const handleClickReportBug = () => {
        window.open("https://github.com/quarterfall/quarterfall-open/issues");
        setAnchorEl(null);
    };

    if (!me) {
        return null;
    }
    const showOrganizationList = me.organizations?.length > 1;
    const isTeacher = me?.organizationRole !== RoleType.organizationStudent;

    return (
        <>
            <IconButton
                sx={{
                    padding: 0,
                    marginLeft: 1,
                }}
                aria-owns={isMenuOpen ? "material-appbar" : undefined}
                aria-haspopup="true"
                onClick={handleMenuOpen}
                size="large"
            >
                <UserAvatar user={me} />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={isMenuOpen}
                onClose={handleMenuClose}
                disableAutoFocusItem={true}
                MenuListProps={{
                    sx: { padding: 0, width: 300 },
                }}
            >
                <ListItem>
                    <ListItemIcon>
                        <UserAvatar user={me} />
                    </ListItemIcon>
                    <ListItemText
                        primary={
                            me.firstName && me.lastName
                                ? `${me.firstName} ${me.lastName}`
                                : me.emailAddress
                        }
                        secondary={me?.organization?.name}
                        sx={{ overflowWrap: "break-word" }}
                    />
                </ListItem>
                <Divider />

                {showOrganizationList && (
                    <ListItem dense>
                        <ListItemIcon />
                        <ListItemText secondary={t("selectYourOrganization")} />
                    </ListItem>
                )}

                {showOrganizationList &&
                    me.organizations.map((org) => (
                        <MenuItem
                            key={`org_${org.id}`}
                            onClick={() => handleSwitchOrganization(org)}
                            sx={{
                                wordWrap: "break-word",
                            }}
                        >
                            <ListItemIcon>
                                {me.organization?.id === org.id && (
                                    <CheckIcon />
                                )}
                            </ListItemIcon>
                            <ListItemText
                                primary={org.name}
                                primaryTypographyProps={{
                                    sx: {
                                        whiteSpace: "normal",
                                    },
                                }}
                            />
                        </MenuItem>
                    ))}
                {showOrganizationList && <Divider />}

                <MenuItem
                    onClick={() => {
                        router.push("/user");
                        setAnchorEl(null);
                    }}
                >
                    <ListItemIcon>
                        <PersonIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("personalSettings")} />
                </MenuItem>
                {me.organization && can(Permission.updateOrganization) && (
                    <MenuItem
                        onClick={() => {
                            router.push("/organization");
                            setAnchorEl(null);
                        }}
                    >
                        <ListItemIcon>
                            <OrganizationIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("organizationSettings")} />
                    </MenuItem>
                )}
                <Divider />

                {me.isSysAdmin && (
                    <MenuItem
                        onClick={() => {
                            router.push("/admin");
                            setAnchorEl(null);
                        }}
                    >
                        <ListItemIcon>
                            <AdminIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("systemAdministration")} />
                    </MenuItem>
                )}
                <MenuItem onClick={handleClickKnowledgeBase}>
                    <ListItemIcon>
                        <MenuBookIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("knowledgeBase")} />
                </MenuItem>
                {isTeacher && (
                    <MenuItem onClick={handleClickReportBug}>
                        <ListItemIcon>
                            <BugReportIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("reportBug")} />
                    </MenuItem>
                )}
                <MenuItem
                    onClick={() => {
                        setConfirmLogoutDialogOpen(true);
                        setAnchorEl(null);
                    }}
                >
                    <ListItemIcon>
                        <ExitToAppIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("logout")} />
                </MenuItem>

                <Box>
                    <Divider />
                    <Box
                        sx={{
                            backgroundColor: colors.appBar,
                            padding: 0.5,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "flex-end",
                            color: "white",
                        }}
                    >
                        <Typography variant="caption">
                            v{config.version}
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography
                            variant="caption"
                            sx={{
                                marginRight: 0.5,
                            }}
                        >
                            {t("poweredBy")}
                        </Typography>
                        <Box
                            component="img"
                            src={`/logo.png`}
                            alt={"siteName"}
                            sx={{
                                height: 25,
                            }}
                        />
                    </Box>
                </Box>
            </Menu>

            <ConfirmationDialog
                open={confirmLogoutDialogOpen}
                title={t("confirmLogoutTitle")}
                message={t("confirmLogoutMessage")}
                onCancel={() => setConfirmLogoutDialogOpen(false)}
                onContinue={logout}
            />
        </>
    );
}
