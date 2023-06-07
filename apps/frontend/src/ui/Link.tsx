import { Box, Typography, TypographyProps } from "@mui/material";
import RouterLink from "next/link";
import React from "react";

export interface LinkProps extends TypographyProps {
    to: string;
    target?: string;
    disabled?: boolean;
}

export function Link(props: LinkProps) {
    const { to, target, children, disabled, ...rest } = props;

    return (
        <Typography {...rest}>
            {to.startsWith("http://") || to.startsWith("https://") ? (
                disabled ? (
                    <>{children}</>
                ) : (
                    <Box
                        component="a"
                        href={to}
                        target={target}
                        sx={{
                            textTransform: "none",
                            textDecoration: "none",
                            color: "inherit",
                            cursor: "pointer",
                            "&:hover": {
                                textDecoration: "underline",
                            },
                        }}
                    >
                        {children}
                    </Box>
                )
            ) : (
                <RouterLink href={to}>
                    {disabled ? (
                        <>{children}</>
                    ) : (
                        <Box
                            component="a"
                            target={target}
                            sx={{
                                textTransform: "none",
                                textDecoration: "none",
                                color: "inherit",
                                "&:hover": {
                                    textDecoration: "underline",
                                },
                                cursor: "pointer",
                            }}
                        >
                            {children}
                        </Box>
                    )}
                </RouterLink>
            )}
        </Typography>
    );
}
