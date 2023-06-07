import {
    alpha,
    createTheme,
    darken,
    StyledEngineProvider,
    Theme,
    ThemeProvider,
} from "@mui/material";
import { Shadows } from "@mui/material/styles/shadows";
import { colors } from "config";
import { useAuthContext } from "context/AuthProvider";
import { selectCodeEditorTheme } from "context/theme/CodeEditorTheme";
import { useStore } from "context/UIStoreProvider";
import { ReactNode, useEffect, useMemo } from "react";

declare module "@mui/material/styles" {
    interface DefaultTheme extends Theme {}
}

declare module "@mui/material/Button" {
    interface ButtonPropsColorOverrides {
        grey: true;
    }
}

declare module "@mui/material" {
    interface Color {
        main: string;
        dark: string;
    }
}

export interface LightDarkThemeProviderProps {
    children: ReactNode;
}

export function LightDarkThemeProvider(props: LightDarkThemeProviderProps) {
    const { darkMode } = useStore();
    const { me } = useAuthContext();

    // create the theme
    const theme = useMemo(() => {
        return createTheme({
            palette: {
                mode: darkMode ? "dark" : "light",
                primary: {
                    main: me?.organization?.primaryColor || colors.primary,
                },
                secondary: {
                    main: me?.organization?.secondaryColor || colors.secondary,
                },
                grey: {
                    main: colors.paperDark,
                    dark: darken(colors.paperDark, 0.2),
                },

                ...(darkMode && {
                    background: {
                        paper: colors.paperDark,
                        default: darken(colors.paperDark, 0.2),
                    },
                }),
            },
            shape: { borderRadius: 8 },
            breakpoints: {
                values: {
                    xs: 0,
                    sm: 600,
                    md: 960,
                    lg: 1280,
                    xl: 1920,
                },
            },
            typography: {
                fontFamily: ["Poppins", "sans-serif"].join(","),
            },
            components: {
                MuiCssBaseline: {
                    styleOverrides: `@font-face{
                            font-family: 'Poppins'
                        }`,
                },
                MuiDialogContent: {
                    styleOverrides: {
                        root: { paddingTop: `8px !important` },
                    },
                },
                MuiButton: {
                    defaultProps: {
                        color: "grey",
                    },
                },
            },
        });
    }, [darkMode, me]);

    // update the code editor theme if the dark mode setting changes
    useEffect(() => {
        selectCodeEditorTheme(darkMode);
    }, [darkMode]);

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider
                theme={createTheme(theme, {
                    shadows: Array(25).fill("none") as Shadows,
                    components: {
                        MuiPaper: {
                            defaultProps: {
                                elevation: 0,
                                variant: "outlined",
                            },
                        },
                        MuiListItem: {
                            styleOverrides: {
                                root: {
                                    borderRadius: theme.shape
                                        .borderRadius as number,
                                    "&.MuiButtonBase-root": {
                                        width: "98%",
                                        margin: "4px auto",
                                    },
                                },
                            },
                        },
                        MuiListItemButton: {
                            styleOverrides: {
                                root: {
                                    borderRadius: theme.shape
                                        .borderRadius as number,
                                    "&.MuiButtonBase-root": {
                                        width: "98%",
                                        margin: "4px auto",
                                    },
                                },
                            },
                        },
                        MuiMenuItem: {
                            styleOverrides: {
                                root: {
                                    "&:hover": {
                                        borderRadius: theme.shape
                                            .borderRadius as number,
                                    },
                                    margin: 4,
                                },
                            },
                        },
                        MuiListItemIcon: {
                            styleOverrides: {
                                root: {
                                    minWidth: "50px",
                                },
                            },
                        },
                        MuiButton: {
                            variants: [
                                {
                                    props: {
                                        variant: "contained",
                                        color: "grey",
                                    },
                                    style: {
                                        color: theme.palette.getContrastText(
                                            theme.palette.grey[300]
                                        ),
                                    },
                                },
                                {
                                    props: {
                                        variant: "outlined",
                                        color: "grey",
                                    },
                                    style: {
                                        color: theme.palette.text.primary,
                                        borderColor:
                                            theme.palette.mode === "light"
                                                ? "rgba(0, 0, 0, 0.23)"
                                                : "rgba(255, 255, 255, 0.23)",
                                        "&.Mui-disabled": {
                                            border: `1px solid ${theme.palette.action.disabledBackground}`,
                                        },
                                        "&:hover": {
                                            borderColor:
                                                theme.palette.mode === "light"
                                                    ? "rgba(0, 0, 0, 0.23)"
                                                    : "rgba(255, 255, 255, 0.23)",
                                            backgroundColor: alpha(
                                                theme.palette.text.primary,
                                                theme.palette.action
                                                    .hoverOpacity
                                            ),
                                        },
                                    },
                                },
                                {
                                    props: { color: "grey", variant: "text" },
                                    style: {
                                        color: theme.palette.text.primary,
                                        "&:hover": {
                                            backgroundColor: alpha(
                                                theme.palette.text.primary,
                                                theme.palette.action
                                                    .hoverOpacity
                                            ),
                                        },
                                    },
                                },
                            ],
                        },
                    },
                })}
                {...props}
            />
        </StyledEngineProvider>
    );
}
