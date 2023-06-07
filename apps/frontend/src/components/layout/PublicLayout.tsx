import { Box, CssBaseline, Grid, Toolbar } from "@mui/material";
import { useAuthContext } from "context/AuthProvider";
import { ReactNode } from "react";
import { Link } from "ui/Link";
import { Brand } from "./Brand";
import { ColoredAppBar } from "./ColoredAppBar";

interface LayoutProps {
    children: ReactNode;
}

/** Persistent application layout, including CSS baseline. */
export function PublicLayout(props: LayoutProps) {
    const { children } = props;
    const { me } = useAuthContext();
    const url = me?.organization?.website || "https://quarterfall.com";

    return (
        <div id="layout">
            <CssBaseline enableColorScheme />
            <ColoredAppBar position="sticky">
                <Toolbar
                    sx={{
                        paddingLeft: 1,
                        paddingRight: 1,
                        display: "flex",
                        justifyItems: "space-between",
                    }}
                >
                    <Grid
                        container
                        direction="row"
                        spacing={1}
                        alignItems="center"
                    >
                        <Grid item>
                            <Link to={url} target="_blank">
                                <Brand alwaysShowFullLogo />
                            </Link>
                        </Grid>
                    </Grid>
                </Toolbar>
            </ColoredAppBar>
            <Box minWidth={0} padding={1}>
                {children}
            </Box>
        </div>
    );
}
