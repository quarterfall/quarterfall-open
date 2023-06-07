import FormControlLabel, {
    FormControlLabelProps,
} from "@mui/material/FormControlLabel";
import Switch, { SwitchProps } from "@mui/material/Switch";
import React from "react";

export type LabeledSwitchProps = SwitchProps & {
    label?: string;
    labelPlacement?: "start" | "end" | "top" | "bottom";
    labelProps?: Partial<FormControlLabelProps>;
};

export function LabeledSwitch(props: LabeledSwitchProps) {
    const { label, labelPlacement = "end", labelProps, ...rest } = props;

    const switchComponent = <Switch color="primary" {...rest} />;

    if (label) {
        return (
            <FormControlLabel
                control={switchComponent}
                label={label}
                labelPlacement={labelPlacement}
                {...labelProps}
            />
        );
    } else {
        return switchComponent;
    }
}
