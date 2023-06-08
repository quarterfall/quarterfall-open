import { Box, CssBaseline, Drawer, Hidden, Toolbar } from "@mui/material";
import { styled } from "@mui/material/styles";
import clsx from "clsx";
import React, { ReactNode, useState } from "react";
import { useWindowSize } from "ui/hooks/Size";
import { Header } from "./Header";

const PREFIX = "DrawerLayout";
const drawerWidth = 240;

const classes = {
    root: `${PREFIX}-root`,
    menuButton: `${PREFIX}-menuButton`,
    hide: `${PREFIX}-hide`,
    drawer: `${PREFIX}-drawer`,
    drawerPaper: `${PREFIX}-drawerPaper`,
    drawerHeader: `${PREFIX}-drawerHeader`,
    contentPadding: `${PREFIX}-contentPadding`,
    content: `${PREFIX}-content`,
    contentShift: `${PREFIX}-contentShift`,
};

const StyledBox = styled(Box)(({ theme }) => ({
    [`&.${classes.root}`]: {
        display: "flex",
        flexDirection: "column",
    },

    [`& .${classes.menuButton}`]: {
        marginRight: theme.spacing(2),
    },

    [`& .${classes.hide}`]: {
        display: "none",
    },

    [`& .${classes.drawer}`]: {
        width: drawerWidth,
        flexShrink: 0,
    },

    [`& .${classes.drawerPaper}`]: {
        width: drawerWidth,
        borderLeft: "none",
        borderTop: "none",
        marginTop: 0.2,
    },

    [`& .${classes.drawerHeader}`]: {
        display: "flex",
        alignItems: "center",
        padding: theme.spacing(0, 1),
        justifyContent: "flex-end",
    },

    [`& .${classes.contentPadding}`]: {
        padding: theme.spacing(1),
    },

    [`& .${classes.content}`]: {
        minWidth: 0,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: 0,
    },

    [`& .${classes.contentShift}`]: {
        transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: drawerWidth,
    },
}));

export interface DrawerMenuProps<MenuItemType> {
    selected?: MenuItemType;
}

export interface DrawerLayoutProps<MenuItemType> {
    noScrolling?: boolean;
    noMainPadding?: boolean;
    component: React.ComponentType<DrawerMenuProps<MenuItemType>>;
    selected?: MenuItemType;
    children?: ReactNode;
    menuProps?: any;
}

export function DrawerLayout<MenuItemType>(
    props: DrawerLayoutProps<MenuItemType>
) {
    const {
        children,
        component: DrawerMenu,
        noScrolling,
        noMainPadding,
        selected,
        menuProps,
    } = props;

    const [drawerOpen, setDrawerOpen] = useState(false);
    const windowSize = useWindowSize();

    return (
        <StyledBox
            className={classes.root}
            sx={noScrolling ? windowSize : undefined}
        >
            <CssBaseline enableColorScheme />
            <Header onDrawerOpen={() => setDrawerOpen(true)} />
            <Hidden smDown>
                {DrawerMenu && (
                    <Drawer
                        className={classes.drawer}
                        variant="permanent"
                        anchor="left"
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                    >
                        <Toolbar />
                        <DrawerMenu selected={selected} {...menuProps} />
                    </Drawer>
                )}
                <Box
                    component="main"
                    className={clsx(classes.content, classes.contentShift, {
                        [classes.contentPadding]: !noMainPadding,
                    })}
                >
                    <Box className={classes.drawerHeader} />
                    {children}
                </Box>
            </Hidden>

            <Hidden smUp>
                {DrawerMenu && (
                    <Drawer
                        className={classes.drawer}
                        anchor="left"
                        open={drawerOpen}
                        onClose={() => setDrawerOpen(false)}
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                    >
                        <Toolbar />
                        <DrawerMenu selected={selected} {...menuProps} />
                    </Drawer>
                )}
                <Box
                    component="main"
                    className={clsx(classes.content, {
                        [classes.contentPadding]: !noMainPadding,
                    })}
                >
                    <Box className={classes.drawerHeader} />
                    {children}
                </Box>
            </Hidden>
        </StyledBox>
    );
}
