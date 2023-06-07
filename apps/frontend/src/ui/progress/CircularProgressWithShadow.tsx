import CheckIcon from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";
import CircularProgress, {
    CircularProgressProps,
} from "@mui/material/CircularProgress";

type CircularProgressWithShadowProps = CircularProgressProps & {
    value: number;
};

export const CircularProgressWithShadow = (
    props: CircularProgressWithShadowProps
) => {
    return props.value !== 100 ? (
        <Box
            sx={{
                position: "relative",
                display: "inline-flex",
                marginLeft: 0.2,
            }}
        >
            <CircularProgress
                variant="determinate"
                sx={{
                    color: (theme) => theme.palette.action.disabled,
                }}
                {...props}
                value={100}
            />
            <CircularProgress
                variant="determinate"
                sx={{
                    circle: {
                        strokeLinecap: "round",
                    },
                    animationDuration: "550ms",
                    position: "absolute",
                    left: 0,
                    color: (theme) => theme.palette.secondary.main,
                }}
                {...props}
            />
        </Box>
    ) : (
        <CheckIcon
            sx={{
                color: "secondary.main",
            }}
        />
    );
};
