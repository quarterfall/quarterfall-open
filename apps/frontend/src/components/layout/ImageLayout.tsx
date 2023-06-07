import { AppBar, Box, CssBaseline, Grid, Hidden, Toolbar } from "@mui/material";
import { ReactNode } from "react";
import { useBackgroundImage } from "ui/hooks/BackgroundImage";
import { Brand } from "./Brand";
import { ColoredAppBar } from "./ColoredAppBar";

const mainSx = {
    minWidth: 0,
    padding: 1,
};

interface ImageLayoutProps {
    image: string;
    children: ReactNode;
}

function QFToolbar() {
    return (
        <Toolbar sx={{ paddingLeft: 1, paddingRight: 1 }}>
            <Grid container direction="row" alignItems="center">
                <Grid
                    item
                    sx={{
                        filter: (theme) =>
                            `drop-shadow(0 0.05rem 0.15rem ${theme.palette.grey[700]})`,
                    }}
                >
                    <Brand alwaysShowFullLogo />
                </Grid>
            </Grid>
        </Toolbar>
    );
}

function DesktopLayout(props: ImageLayoutProps) {
    const { image, children } = props;
    useBackgroundImage(image);

    return (
        <>
            <AppBar
                sx={{
                    background: "transparent",
                    boxShadow: "none",
                    border: "none",
                }}
                position="static"
            >
                <QFToolbar />
            </AppBar>
            <Box sx={mainSx}>{children}</Box>
        </>
    );
}

function MobileLayout(props: ImageLayoutProps) {
    const { children } = props;
    useBackgroundImage("");

    return (
        <>
            <ColoredAppBar position="static">
                <QFToolbar />
            </ColoredAppBar>
            <Box sx={mainSx}>{children}</Box>
        </>
    );
}

/** Persistent application layout, including CSS baseline. */
export function ImageLayout(props: ImageLayoutProps) {
    return (
        <>
            <CssBaseline enableColorScheme />
            <Hidden smUp>
                <MobileLayout {...props} />
            </Hidden>
            <Hidden smDown>
                <DesktopLayout {...props} />
            </Hidden>
        </>
    );
}
