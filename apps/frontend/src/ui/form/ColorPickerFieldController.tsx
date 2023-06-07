import {
    Control,
    Controller,
    ControllerProps,
    FieldPath,
    FieldValues,
} from "react-hook-form";
import ColorPickerField, {
    ColorPickerFieldProps,
} from "ui/form/inputs/ColorPickerField";

export type ColorPickerFieldControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = Omit<ColorPickerFieldProps, "field"> & {
    name: TName;
    control: Control<TFieldValues>;
    controllerProps?: Partial<ControllerProps<TFieldValues, TName>>;
};

export function ColorPickerFieldController<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: ColorPickerFieldControllerProps<TFieldValues, TName>) {
    const { control, name, controllerProps, ...rest } = props;

    return (
        <Controller
            control={control}
            name={name}
            {...controllerProps}
            render={({ field }) => <ColorPickerField field={field} {...rest} />}
        />
    );
}
