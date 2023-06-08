import RestoreIcon from "@mui/icons-material/Restore";
import {
    Box,
    Button,
    IconButton,
    Popover,
    Tooltip,
    useTheme,
} from "@mui/material";
import React, { useState } from "react";
import { ChromePicker } from "react-color";
import { useTranslation } from "react-i18next";

export type ColorPickerFieldProps = {
    label?: string;
    defaultColor?: string;
    field: any;
};

export default function ColorPickerField(props: ColorPickerFieldProps) {
    const { label, defaultColor, field } = props;

    const [color, setColor] = useState(field.value);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const theme = useTheme();
    const { t } = useTranslation();

    const handleResetDefault = () => {
        setColor(defaultColor);
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleChange = (c) => {
        setColor(c.hex);
    };

    const handleOk = () => {
        field.onChange({ target: { value: color } });
        setAnchorEl(null);
    };

    return (
        <>
            <Button
                size="large"
                startIcon={
                    <Box
                        sx={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            border: (theme) =>
                                `1px solid ${theme.palette.text.secondary}`,
                            backgroundColor: field.value,
                        }}
                    />
                }
                onClick={handleClick}
            >
                {label}
            </Button>

            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
            >
                <ChromePicker
                    styles={{
                        default: {
                            picker: { boxShadow: "none" },
                            body: {
                                backgroundColor: theme.palette.background.paper,
                            },
                        },
                    }}
                    color={color}
                    onChange={handleChange}
                    disableAlpha
                />
                <Box
                    display="flex"
                    flexDirection="row"
                    alignItems="flex-end"
                    sx={{ padding: 1 }}
                >
                    {defaultColor && (
                        <Tooltip title={t("resetToDefault")!}>
                            <span>
                                <IconButton
                                    sx={{
                                        padding: 1,
                                    }}
                                    onClick={handleResetDefault}
                                    disabled={color === defaultColor}
                                    size="large"
                                >
                                    <RestoreIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    )}
                    <Box flexGrow={1} />
                    <Button size="small" onClick={handleClose}>
                        {t("cancel")}
                    </Button>
                    <Button
                        size="small"
                        color="primary"
                        onClick={handleOk}
                        type="submit"
                    >
                        {t("ok")}
                    </Button>
                </Box>
            </Popover>
        </>
    );
}
