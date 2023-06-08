import {
    IconButton,
    InputAdornment,
    TextField,
    TextFieldProps,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import React, { useState } from "react";
import { Control, Controller } from "react-hook-form";

export type PasswordFieldControllerProps = TextFieldProps & {
    control: Control;
    rules?: any;
};

export function PasswordFieldController(props: PasswordFieldControllerProps) {
    const { type, InputProps, name, control, rules, ...rest } = props;
    const [showText, setShowText] = useState(false);
    const toggleShowText = () => {
        setShowText(!showText);
    };

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            defaultValue=""
            render={({ field }) => (
                <TextField
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    edge="end"
                                    disableRipple
                                    disableTouchRipple
                                    onClick={toggleShowText}
                                    size="large">
                                    {showText ? (
                                        <VisibilityIcon />
                                    ) : (
                                        <VisibilityOffIcon />
                                    )}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    type={showText ? "text" : "password"}
                    {...field}
                    {...rest}
                />
            )}
        />
    );
}
