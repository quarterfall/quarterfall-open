import { Tooltip } from "@mui/material";
import LinearProgress, {
    linearProgressClasses,
    LinearProgressProps,
} from "@mui/material/LinearProgress";

type ProminentLinearProgressProps = LinearProgressProps & {};

export const ProminentLinearProgress = (
    props: ProminentLinearProgressProps
) => {
    return (
        <Tooltip title={`${props.value}%`}>
            <LinearProgress
                sx={(theme) => ({
                    height: 10,
                    borderRadius: 5,
                    [`&.${linearProgressClasses.colorPrimary}`]: {
                        backgroundColor:
                            theme.palette.grey[
                                theme.palette.mode === "light" ? 200 : 800
                            ],
                    },
                    [`& .${linearProgressClasses.bar}`]: {
                        borderRadius: 5,
                        backgroundColor: theme.palette.secondary.main,
                    },
                })}
                {...props}
            />
        </Tooltip>
    );
};
