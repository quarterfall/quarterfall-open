import { Box, Card, CardProps, Tooltip } from "@mui/material";

export interface ClickableCardProps extends CardProps {
    disabled?: boolean;
    tooltipTitle?: string;
}

export function ClickableCard(props: ClickableCardProps) {
    const { children, disabled, sx, tooltipTitle, ...rest } = props;

    return (
        <Card sx={{ cursor: "pointer", position: "relative", ...sx }} {...rest}>
            <Tooltip title={tooltipTitle ? tooltipTitle : ""} arrow>
                <Box
                    component="div"
                    sx={{
                        ...(!disabled && {
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            cursor: "pointer",
                            "&:hover": {
                                backgroundColor: "action.hover",
                            },
                            top: 0,
                            left: 0,
                            zIndex: 1,
                        }),
                    }}
                />
            </Tooltip>

            {children}
        </Card>
    );
}
