import { Autocomplete, AutocompleteProps } from "@mui/material";
import React from "react";
import { Control, Controller } from "react-hook-form";

export interface MultiSelectFieldControllerProps<T = string> {
    options?: T[];
    selectedOptions?: T[];
    onChangeSelectedOptions?: (selected: T[]) => void;
}

export type AutocompleteControlProps<
    T,
    Multiple extends boolean,
    DisableClearable extends boolean,
    FreeSolo extends boolean
> = AutocompleteProps<T, Multiple, DisableClearable, FreeSolo> & {
    control: Control;
    name: string;
};

export function AutocompleteController<
    T,
    Multiple extends boolean,
    DisableClearable extends boolean,
    FreeSolo extends boolean
>(props: AutocompleteControlProps<T, Multiple, DisableClearable, FreeSolo>) {
    const { control, name, ...rest } = props;

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value } }) => {
                const handleChange = (event, value) => {
                    onChange(value);
                };
                return (
                    <Autocomplete
                        value={value}
                        onChange={handleChange}
                        {...rest}
                    />
                );
            }}
        />
    );
}
