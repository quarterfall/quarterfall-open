import { Checkbox, CheckboxProps } from "@mui/material";
import {
    Control,
    Controller,
    ControllerProps,
    FieldPath,
    FieldValues,
} from "react-hook-form";

export type UnnamedCheckboxProps = Pick<
    CheckboxProps,
    Exclude<keyof CheckboxProps, "name">
>;

export type CheckboxControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = UnnamedCheckboxProps & {
    name: TName;
    control: Control<TFieldValues>;
    controllerProps?: Partial<ControllerProps<TFieldValues, TName>>;
};

export function CheckboxController(props: CheckboxControllerProps) {
    const { control, controllerProps, name, ...rest } = props;

    return (
        <Controller
            name={name as any}
            control={control}
            {...controllerProps}
            render={({ field: { onChange, value } }) => (
                <Checkbox
                    checked={Boolean(value || false)}
                    onChange={(e, v) => onChange(v)}
                    {...rest}
                />
            )}
        />
    );
}
