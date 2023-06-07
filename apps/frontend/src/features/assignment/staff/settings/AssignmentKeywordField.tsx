import {
    Autocomplete,
    AutocompleteProps,
    Chip,
    TextField,
} from "@mui/material";
import { Control, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

export interface AssignmentKeywordFieldProps<
    T,
    Multiple extends boolean | undefined,
    DisableClearable extends boolean | undefined,
    FreeSolo extends boolean | undefined
> extends Pick<
        AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
        Exclude<
            keyof AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
            "options" | "renderInput"
        >
    > {
    name: string;
    control?: Control;
}

export function AssignmentKeywordField<
    T = string,
    Multiple extends boolean | undefined = undefined,
    DisableClearable extends boolean | undefined = undefined,
    FreeSolo extends boolean | undefined = undefined
>(props: AssignmentKeywordFieldProps<T, Multiple, DisableClearable, FreeSolo>) {
    const { t } = useTranslation();

    const { name, control, ...rest } = props;

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value } }) => (
                <Autocomplete
                    multiple
                    options={[]}
                    value={value || []}
                    freeSolo
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            label={t("assignment:keywords")}
                            placeholder={
                                props.disabled
                                    ? null
                                    : t("assignment:keywordPlaceHolder")
                            }
                        />
                    )}
                    renderTags={(value: string[], getTagProps) =>
                        value.map((option, index) => (
                            <Chip
                                key={index}
                                label={option}
                                style={{
                                    margin: "4px 2px",
                                }}
                                {...getTagProps({
                                    index,
                                })}
                            />
                        ))
                    }
                    onChange={(_, data) => onChange(data)}
                    {...rest}
                />
            )}
        />
    );
}
