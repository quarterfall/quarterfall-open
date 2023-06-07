import merge from "lodash/merge";
import { ReactNode } from "react";
import {
    Controller,
    FieldPath,
    FieldValues,
    useFormState,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MarkdownField } from "ui/form/inputs/MarkdownField";
import { TextFieldControllerProps } from "./TextFieldController";

export type MarkdownFieldControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = TextFieldControllerProps<TFieldValues, TName> & {
    showPreviewToggle?: boolean;
    action?: ReactNode;
};

export function MarkdownFieldController<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: MarkdownFieldControllerProps<TFieldValues, TName>) {
    const {
        control,
        name,
        controllerProps,
        helperText,
        variant = "outlined",
        showPreviewToggle = false,
        action,
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
            name={name}
            control={control}
            {...updatedControllerProps}
            render={({ field: { onChange, value } }) => (
                <MarkdownField
                    value={value || ""}
                    variant={variant}
                    onChange={onChange}
                    error={error}
                    helperText={helperErrorText}
                    showPreviewToggle={showPreviewToggle}
                    action={action}
                    {...rest}
                />
            )}
        />
    );
}
