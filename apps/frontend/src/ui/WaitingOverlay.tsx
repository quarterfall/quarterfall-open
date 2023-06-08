import { Box, BoxProps, CircularProgress } from "@mui/material";
import React from "react";

export type WaitingOverlayProps = React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
> &
    BoxProps & {
        waiting?: boolean;
    };

export function WaitingOverlay(props: WaitingOverlayProps) {
    const { waiting, children, ...rest } = props;

    return (
        <Box sx={{ position: "relative", margin: 0, padding: 0 }} {...rest}>
            {children}
            {waiting && (
                <CircularProgress
                    color="primary"
                    size={24}
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        marginTop: -1.5,
                        marginLeft: -1.5,
                    }}
                />
            )}
        </Box>
    );
}
