import { Box, CssBaseline } from "@mui/material";
import { ReactNode } from "react";
import { Header } from "./Header";

interface LayoutProps {
    noMainPadding?: boolean;
    children: ReactNode;
    subheader?: ReactNode;
}

/** Persistent application layout, including CSS baseline. */
export function Layout(props: LayoutProps) {
    const { subheader, noMainPadding, children } = props;

    return (
        <div id="layout">
            <CssBaseline enableColorScheme />
            <Header />

            {/* <CookieNotice /> */}
            {subheader && (
                <Box sx={{ padding: 1 }}>
                    <Box
                        sx={{
                            backgroundColor: "background.default",
                            padding: 1,
                        }}
                    >
                        {subheader}
                    </Box>
                </Box>
            )}
            <Box
                sx={{
                    minWidth: 0,
                    ...(!noMainPadding && { padding: 1 }),
                }}
            >
                {children}
            </Box>
        </div>
    );
}
