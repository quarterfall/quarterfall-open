import { Box } from "@mui/material";
import React from "react";

interface TabPanelProps {
    children?: React.ReactNode;
    sx?: any;
    index: number;
    value: number;
}

export const TabPanel = (props: TabPanelProps) => {
    const { children, value, sx, index, ...rest } = props;

    return (
        <Box
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            sx={{
                width: "100%",
                height: "100%",
                paddingY: 1,
            }}
        >
            {value === index && (
                <Box
                    sx={{
                        ...sx,
                        height: "100%",
                    }}
                >
                    {children}
                </Box>
            )}
        </Box>
    );
};
