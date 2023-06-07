import { Box } from "@mui/material";
import React, { ReactNode } from "react";

export type AlignProps = {
    children: ReactNode;
    right?: boolean;
    center?: boolean;
    left?: boolean;
};

export function Align(props: AlignProps) {
    const { right, center, left, ...rest } = props;

    return (
        <Box
            sx={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
                ...(left && { justifyContent: "flex-start" }),
                ...(right && { justifyContent: "flex-end" }),
            }}
            {...rest}
        />
    );
}
