import {
    IconButton,
    InputAdornment,
    TextField,
    TextFieldProps,
    Tooltip,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import React from "react";
import { useTranslation } from "react-i18next";

export function SearchField(props: TextFieldProps) {
    const { t } = useTranslation();

    const handleClear = () => {
        if (!props.onChange) {
            return;
        }
        props.onChange({
            target: {
                value: "",
            },
        } as any);
    };

    return (
        <TextField
            placeholder={t("search")}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <Tooltip title={t("search")!}>
                            <SearchIcon color="inherit" fontSize="small" />
                        </Tooltip>
                    </InputAdornment>
                ),
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            disabled={!props.value}
                            onClick={handleClear}
                            size="small"
                        >
                            <ClearIcon color="inherit" fontSize="small" />
                        </IconButton>
                    </InputAdornment>
                ),
            }}
            {...props}
        />
    );
}
