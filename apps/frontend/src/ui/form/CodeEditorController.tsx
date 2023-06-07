import merge from "lodash/merge";
import { ReactNode } from "react";
import {
    Control,
    Controller,
    ControllerProps,
    FieldPath,
    FieldValues,
    useFormState,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { CodeEditor, CodeEditorProps } from "../code/CodeEditor";

export type CodeEditorControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = CodeEditorProps & {
    name: TName;
    control: Control<TFieldValues>;
    controllerProps?: Partial<ControllerProps<TFieldValues, TName>>;
    helperText?: ReactNode;
    resetToTemplateButton?: ReactNode;
};

export function CodeEditorController<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: CodeEditorControllerProps<TFieldValues, TName>) {
    const {
        name,
        control,
        controllerProps = {},
        helperText,
        autoFocus,
        resetToTemplateButton,
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
                <CodeEditor
                    onChange={onChange}
                    value={value as string}
                    error={error}
                    helperText={helperErrorText}
                    autoFocus={autoFocus}
                    resetToTemplateButton={resetToTemplateButton}
                    {...rest}
                />
            )}
        />
    );
}
