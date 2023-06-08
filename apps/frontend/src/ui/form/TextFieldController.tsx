import { TextField, TextFieldProps } from "@mui/material";
import merge from "lodash/merge";
import {
    Control,
    Controller,
    ControllerProps,
    FieldPath,
    FieldValues,
    useFormState,
} from "react-hook-form";
import { useTranslation } from "react-i18next";

export type UnnamedTextFieldProps = Pick<
    TextFieldProps,
    Exclude<keyof TextFieldProps, "name">
>;

export type TextFieldControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = UnnamedTextFieldProps & {
    name: TName;
    control: Control<TFieldValues>;
    controllerProps?: Partial<ControllerProps<TFieldValues, TName>>;
};

export function TextFieldController<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: TextFieldControllerProps<TFieldValues, TName>) {
    const {
        control,
        name,
        controllerProps,
        helperText,
        variant = "outlined",
        ...rest
    } = props;
    const { errors } = useFormState({ control });
    const { t } = useTranslation();

    const updatedControllerProps = merge(
        {
            rules: {
                required: props.required ? t("validationErrorRequired") : false,
            },
        },
        controllerProps || {}
    );

    // construct the error text
    const error = Boolean((errors as any)[name]);
    const helperErrorText = error
        ? (errors as any)[name].message || ""
        : helperText;

    return (
        <Controller
            name={name as any}
            control={control}
            {...updatedControllerProps}
            render={({ field: { onChange, value } }) => (
                <TextField
                    value={value || ""}
                    variant={variant}
                    onChange={onChange}
                    error={error}
                    helperText={helperErrorText}
                    {...rest}
                />
            )}
        />
    );
}
