import { FormControl, InputLabel, OutlinedInput } from "@mui/material";
import Select, { SelectProps } from "@mui/material/Select";
import React from "react";
import {
    Control,
    Controller,
    ControllerProps,
    FieldPath,
    FieldValues,
} from "react-hook-form";

export type UnnamedSelectProps = Pick<
    SelectProps,
    Exclude<keyof SelectProps, "name">
>;
export type SelectControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = UnnamedSelectProps & {
    name: TName;
    control: Control<TFieldValues>;
    controllerProps?: Partial<ControllerProps<TFieldValues, TName>>;
};

export function SelectController<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: SelectControllerProps<TFieldValues, TName>) {
    const {
        control,
        controllerProps,
        name,
        variant,
        required,
        label,
        fullWidth,
        ...rest
    } = props;

    return (
        <Controller
            name={name}
            control={control}
            {...controllerProps}
            rules={{ required: props.required }}
            render={({ field: { onChange, value } }) => (
                <FormControl
                    variant={variant}
                    required={required}
                    fullWidth={fullWidth}
                >
                    {label && (
                        <InputLabel shrink variant={variant}>
                            {label}
                        </InputLabel>
                    )}
                    <Select
                        label={label}
                        value={value || ""}
                        onChange={onChange}
                        required={required}
                        variant={variant}
                        input={
                            variant === "outlined" ? (
                                <OutlinedInput notched label={label} />
                            ) : undefined
                        }
                        style={{ minWidth: 200 }}
                        {...rest}
                    />
                </FormControl>
            )}
        />
    );
}
