import { TextField } from "@mui/material";
import merge from "lodash/merge";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TextFieldControllerProps } from "./TextFieldController";

export function NumberFieldController(props: TextFieldControllerProps) {
    const {
        control,
        name,
        controllerProps,
        helperText,
        variant = "outlined",
        ...rest
    } = props;
    const [stringValue, setStringValue] = useState("");
    const { t } = useTranslation();

    const updatedControllerProps = merge(
        {
            rules: {
                required: props.required ? t("validationErrorRequired") : false,
                validate: (value: number) =>
                    isNaN(value) ? t("validationErrorInvalidNumber") : true,
            },
        },
        controllerProps || {}
    );

    return (
        <Controller
            name={name}
            control={control}
            {...updatedControllerProps}
            render={({
                field: { onChange, value },
                fieldState: { isDirty, error },
            }) => {
                // construct the error text
                const helperErrorText = Boolean(error)
                    ? error["message"] || ""
                    : helperText;

                let renderedStringValue = stringValue;
                if (!isDirty && stringValue === "") {
                    renderedStringValue = value === null ? "" : String(value);
                }
                return (
                    <TextField
                        variant={variant}
                        error={Boolean(error)}
                        helperText={helperErrorText}
                        value={renderedStringValue}
                        onChange={(evt) => {
                            setStringValue(evt.target.value || "");
                            const val =
                                evt.target.value !== ""
                                    ? Number(evt.target.value || "")
                                    : null;
                            onChange({
                                target: {
                                    value: val,
                                },
                            });
                        }}
                        {...rest}
                    />
                );
            }}
        />
    );
}
