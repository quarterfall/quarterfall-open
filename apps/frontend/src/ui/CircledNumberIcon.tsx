import { Box, SvgIcon, SvgIconProps } from "@mui/material";

export interface CircledNumberIconProps extends SvgIconProps {
    index: number;
}

export const CircledNumberIcon = (props: CircledNumberIconProps) => {
    const { index, color = "disabled", ...rest } = props;

    return (
        <SvgIcon color={color} {...rest}>
            <circle cx="12" cy="12" r="12" />
            <Box
                component="text"
                x="12"
                y="16"
                textAnchor="middle"
                sx={{
                    fill: (theme) => theme.palette.secondary.contrastText,
                    fontSize: (theme) => theme.typography.caption.fontSize,
                    fontFamily: (theme) => theme.typography.fontFamily,
                    fontWeight: 900,
                }}
            >
                {index}
            </Box>
        </SvgIcon>
    );
};
