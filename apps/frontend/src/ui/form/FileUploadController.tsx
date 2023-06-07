import { DropzoneProps } from "react-dropzone";
import {
    Control,
    Controller,
    ControllerProps,
    FieldPath,
    FieldValues,
} from "react-hook-form";
import { DropzoneField } from "ui/form/inputs/DropzoneField";

export type FileUploadControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = DropzoneProps & {
    name: TName;
    control: Control<TFieldValues>;
    controllerProps?: Partial<ControllerProps<TFieldValues, TName>>;
    label: string;
    uploading?: boolean;
    allowedFileTypes?: string;
};

export function FileUploadController<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: FileUploadControllerProps<TFieldValues, TName>) {
    const { control, name, controllerProps, uploading, label, ...rest } = props;

    return (
        <Controller
            {...controllerProps}
            control={control}
            name={name}
            render={({ field: { onChange } }) => (
                <DropzoneField
                    handleChange={onChange}
                    label={label}
                    uploading={uploading}
                    {...rest}
                />
            )}
        />
    );
}
