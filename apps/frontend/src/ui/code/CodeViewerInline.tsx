import { Box } from "@mui/material";
import React from "react";

export interface CodeViewerInlineProps {
    value: string;
}

export function CodeViewerInline(props: CodeViewerInlineProps) {
    const { value = "" } = props;

    return (
        <Box
            component="span"
            sx={{
                padding: 0,
                margin: 0,
                fontSize: 14,
                lineHeight: 1.3,
                fontFamily: '"Fira Mono", monospace',
            }}
        >
            {value}
        </Box>
    );
}
