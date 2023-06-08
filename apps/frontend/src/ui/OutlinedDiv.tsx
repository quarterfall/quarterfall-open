import { TextField, TextFieldProps, Tooltip } from "@mui/material";
import { ReactNode } from "react";

type OutlinedDivProps = TextFieldProps & {
    children?: ReactNode;
    shrink?: boolean;
    tooltipTitle?: string | ReactNode;
};

export const OutlinedDiv = (props: OutlinedDivProps) => {
    const {
        children,
        InputProps,
        tooltipTitle = "",
        shrink = true,
        ...rest
    } = props;

    return (
        <Tooltip title={tooltipTitle ? tooltipTitle : ""}>
            <TextField
                InputProps={Object.assign(
                    {
                        inputComponent: "div",
                    },
                    { ...InputProps }
                )}
                variant="outlined"
                multiline
                InputLabelProps={{
                    shrink: shrink,
                }}
                sx={{ width: "100%" }}
                inputProps={{
                    children: children,
                }}
                {...rest}
            />
        </Tooltip>
    );
};
