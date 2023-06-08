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
import {
    EmailAddressesField,
    EmailAddressesFieldProps,
} from "ui/form/inputs/EmailAddressesField";

export type EmailAddressesControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = EmailAddressesFieldProps & {
    name: TName;
    control: Control<TFieldValues>;
    controllerProps?: Partial<ControllerProps<TFieldValues, TName>>;
};

export function EmailAddressesController<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: EmailAddressesControllerProps<TFieldValues, TName>) {
    const { control, name, controllerProps, helperText, required, ...rest } =
        props;
    const { t } = useTranslation();
    const { errors } = useFormState({ control });

    // construct the error text
    const error = Boolean((errors as any)[name]);
    const helperErrorText = error
        ? (errors as any)[name].message || ""
        : helperText;

    const updatedControllerProps = merge(
        {
            rules: {
                required: props.required ? t("validationErrorRequired") : false,
            },
        },
        controllerProps || {}
    );

    return (
        <Controller
            control={control}
            name={name}
            {...updatedControllerProps}
            render={({ field }) => {
                return (
                    <EmailAddressesField
                        field={field}
                        error={error}
                        helperText={helperErrorText}
                        {...rest}
                    />
                );
            }}
        />
    );
}
