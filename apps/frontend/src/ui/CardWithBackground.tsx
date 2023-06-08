import { Box, Card, CardProps } from "@mui/material";

export interface CardWithBackgroundProps extends CardProps {
    index?: number;
    clickable?: boolean;
}

export const CardWithBackground = ({
    children,
    index,
    clickable,
    onClick,
}: CardWithBackgroundProps) => {
    return (
        <Card
            sx={{
                position: "relative",
                border: (theme) => `1px solid ${theme.palette.divider}`,
                width: "100%",
                cursor: "default",
                overflow: "hidden",
            }}
            onClick={onClick}
        >
            {index && (
                <Box
                    sx={{
                        position: "absolute",
                        top: "-45px",
                        left: 0,
                        fontSize: "150px",
                        color: (theme) =>
                            theme.palette.mode === "light"
                                ? theme.palette.grey[500]
                                : theme.palette.grey[200],
                        opacity: 0.2,
                        WebkitTextStroke: (theme) =>
                            `1px ${
                                theme.palette.mode === "light"
                                    ? theme.palette.grey[600]
                                    : theme.palette.grey[300]
                            }`,
                    }}
                >
                    {index}
                </Box>
            )}
            <Box
                sx={{
                    ...(clickable && {
                        width: "100%",
                        height: "100%",
                        cursor: "pointer",
                        "&:hover": {
                            backgroundColor: "action.hover",
                        },
                        position: "absolute",
                        top: 0,
                        left: 0,
                    }),
                }}
            ></Box>
            <Box style={{ overflow: "hidden" }}>{children}</Box>
        </Card>
    );
};
