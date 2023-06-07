import { Tooltip, Typography } from "@mui/material";

export interface ResizableCircleProps {
    text?: string;
}

export const ResizableCircle = (props: ResizableCircleProps) => {
    const { text } = props;
    const strLen = text?.length < 5 ? text.length : 5;

    return (
        <Tooltip title={text}>
            {text?.length < 5 ? (
                <Typography
                    sx={{
                        color: "secondary.main",
                        fontSize: `${strLen === 1 ? 3 : 6 / strLen}rem`,
                        textAlign: "center",
                        backgroundColor: "inherit",
                        border: (theme) =>
                            `3px solid ${theme.palette.secondary.main}`,
                        borderRadius: "50%",
                        width: (theme) => theme.spacing(11),
                        lineHeight: (theme) => theme.spacing(10),
                    }}
                >
                    {text}
                </Typography>
            ) : (
                <Typography color="secondary" variant="h3">
                    {text}
                </Typography>
            )}
        </Tooltip>
    );
};
