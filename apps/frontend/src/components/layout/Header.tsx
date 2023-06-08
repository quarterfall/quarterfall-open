import HelpIcon from "@mui/icons-material/Help";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import LibraryIcon from "@mui/icons-material/Storefront";
import {
    Box,
    Grid,
    Hidden,
    IconButton,
    styled,
    Toolbar,
    Tooltip,
} from "@mui/material";
import { useAuthContext } from "context/AuthProvider";
import { RoleType } from "core";
import { useTranslation } from "react-i18next";
import { Link } from "ui/Link";
import { useNavigation } from "ui/route/Navigation";
import { Brand } from "./Brand";
import { ColoredAppBar } from "./ColoredAppBar";
import { HeaderMenu } from "./HeaderMenu";
import { NotificationsMenu } from "./NotificationsMenu";

export interface HeaderProps {
    onDrawerOpen?: () => void;
    alwaysShowFullLogo?: boolean;
}

const Offset = styled("div")(({ theme }) => theme.mixins.toolbar);

export function Header(props: HeaderProps) {
    const { onDrawerOpen, alwaysShowFullLogo } = props;

    const { me } = useAuthContext();
    const { t } = useTranslation();
    const router = useNavigation();

    return (
        <>
            <ColoredAppBar position="fixed">
                <Toolbar
                    sx={{
                        paddingLeft: 1,
                        paddingRight: 1,
                        display: "flex",
                        direction: "row",
                        justifyItems: "space-between",
                    }}
                >
                    <Grid
                        container
                        direction="row"
                        alignItems="center"
                        spacing={1}
                    >
                        {onDrawerOpen && (
                            <Hidden smUp>
                                <Grid item>
                                    <IconButton
                                        color="inherit"
                                        aria-label="open drawer"
                                        edge="start"
                                        size="large"
                                        onClick={onDrawerOpen}
                                    >
                                        <MenuIcon />
                                    </IconButton>
                                </Grid>
                            </Hidden>
                        )}

                        <Grid item>
                            <Link to="/" disabled={!me}>
                                <Brand
                                    alwaysShowFullLogo={alwaysShowFullLogo}
                                />
                            </Link>
                        </Grid>

                        <Box flexGrow={1} />

                        {me && (
                            <>
                                <Hidden smDown>
                                    <Grid item>
                                        <Tooltip title={t("home")!}>
                                            <IconButton
                                                color="inherit"
                                                size="large"
                                                onClick={() => router.push("/")}
                                            >
                                                <HomeIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                </Hidden>
                            </>
                        )}
                        <Grid item>
                            <Tooltip title={t("help")!}>
                                <IconButton
                                    color="inherit"
                                    onClick={() => {
                                        router.newTab(
                                            `https://help.quarterfall.com/${
                                                me?.organizationRole ===
                                                RoleType.organizationStudent
                                                    ? "for-students"
                                                    : ""
                                            }`
                                        );
                                    }}
                                    size="large"
                                >
                                    <HelpIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        {me && (
                            <>
                                <Grid item>
                                    <NotificationsMenu />
                                </Grid>
                                <Grid item>
                                    <HeaderMenu />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Toolbar>
            </ColoredAppBar>
            <Offset />
        </>
    );
}
