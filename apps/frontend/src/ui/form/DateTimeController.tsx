import ClearIcon from "@mui/icons-material/Clear";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import merge from "lodash/merge";
import { useState } from "react";
import { Controller, useFormState } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDateLocale } from "ui/hooks/DateLocale";

export function DateTimeController(props) {
    const {
        name,
        control,
        controllerProps,
        helperText,
        required = false,
        disabled,
        ...rest
    } = props;
    const { t } = useTranslation();

    const updatedControllerProps = merge(
        {
            rules: {
                required: props.required ? t("validationErrorRequired") : false,
            },
        },
        controllerProps || {}
    );

    const [dateTime, setDateTime] = useState<Date | null>(null);
    const { locale, ampm } = useDateLocale();
    const { errors } = useFormState({ control });

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
            render={({ field: { onChange, value } }) => {
                const handleChangeDate = (date) => {
                    setDateTime(date || null);
                };

                const handleClearDate = (event) => {
                    event.stopPropagation();
                    onChange({ target: { value: null } });
                };

                const handleAccept = (newDate) => {
                    onChange(newDate);
                };
                return (
                    <LocalizationProvider
                        dateAdapter={AdapterDateFns}
                        adapterLocale={locale}
                    >
                        <MobileDateTimePicker
                            ampm={ampm}
                            inputFormat="PPp"
                            value={value || null}
                            onChange={handleChangeDate}
                            onAccept={handleAccept}
                            clearable={!required}
                            disabled={disabled}
                            closeOnSelect
                            hideTabs
                            showToolbar={false}
                            components={{
                                ActionBar: () => <></>,
                            }}
                            disableMaskedInput
                            sx={{
                                "& .MuiPickersToolbar-penIconButton": {
                                    display: "none",
                                },
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    sx={{ minWidth: 300 }}
                                    required={required}
                                    helperText={helperErrorText}
                                    error={error}
                                    disabled={disabled}
                                    InputProps={
                                        !required
                                            ? {
                                                  endAdornment: (
                                                      <InputAdornment position="end">
                                                          <IconButton
                                                              size="small"
                                                              onClick={
                                                                  handleClearDate
                                                              }
                                                              disabled={
                                                                  !value ||
                                                                  disabled
                                                              }
                                                              sx={{
                                                                  marginRight: (
                                                                      theme
                                                                  ) =>
                                                                      theme.spacing(
                                                                          1
                                                                      ),
                                                              }}
                                                          >
                                                              <ClearIcon fontSize="small" />
                                                          </IconButton>
                                                      </InputAdornment>
                                                  ),
                                                  style: {
                                                      paddingRight: 0,
                                                  },
                                              }
                                            : undefined
                                    }
                                />
                            )}
                            {...rest}
                        />
                    </LocalizationProvider>
                );
            }}
        />
    );
}
