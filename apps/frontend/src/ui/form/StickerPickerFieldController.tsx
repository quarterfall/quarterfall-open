import {
    Control,
    Controller,
    ControllerProps,
    FieldPath,
    FieldValues,
} from "react-hook-form";
import {
    StickerPickerField,
    StickerPickerFieldProps,
} from "ui/form/inputs/StickerPickerField";

export type StickerPickerFieldControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = Omit<StickerPickerFieldProps, "field"> & {
    name: TName;
    control: Control<TFieldValues>;
    controllerProps?: Partial<ControllerProps<TFieldValues, TName>>;
};

export function StickerPickerFieldController<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: StickerPickerFieldControllerProps<TFieldValues, TName>) {
    const { control, name, controllerProps, ...rest } = props;

    return (
        <Controller
            control={control}
            name={name}
            {...controllerProps}
            render={({ field }) => (
                <StickerPickerField field={field} {...rest} />
            )}
        />
    );
}
