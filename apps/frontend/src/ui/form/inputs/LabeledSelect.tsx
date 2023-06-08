import {
    FilledInput,
    FormControl,
    InputLabel,
    OutlinedInput,
} from "@mui/material";
import MuiSelect, { SelectProps as MuiSelectProps } from "@mui/material/Select";
import React from "react";

export type LabeledSelectProps = MuiSelectProps & {
    label?: string;
    variant?: "standard" | "filled" | "outlined";
};

export function LabeledSelect(props: LabeledSelectProps) {
    const {
        type,
        label,
        name,
        required,
        onChange,
        variant = "outlined",
        ...rest
    } = props;

    let input: JSX.Element;
    if (variant === "standard") {
        input = <InputLabel />;
    } else if (variant === "filled") {
        input = <FilledInput />;
    } else {
        input = <OutlinedInput label={label} />;
    }

    return (
        <FormControl
            variant={variant}
            fullWidth={props.fullWidth}
            required={required}
        >
            {label && (
                <InputLabel
                    variant={variant || "filled"}
                    shrink
                    required={required}
                >
                    {label}
                </InputLabel>
            )}
            <MuiSelect
                sx={{ display: "flex", alignItems: "center" }}
                onChange={onChange}
                required={required}
                {...rest}
                input={input}
            />
        </FormControl>
    );
}
