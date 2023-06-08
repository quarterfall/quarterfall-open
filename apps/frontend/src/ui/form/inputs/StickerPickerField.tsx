import DeleteIcon from "@mui/icons-material/Delete";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import {
    Box,
    Grid,
    IconButton,
    ImageList,
    ImageListItem,
    Popover,
    Tooltip,
} from "@mui/material";
import { StickerType } from "core";
import React from "react";
import { useTranslation } from "react-i18next";
import { Sticker } from "ui/Sticker";

export type StickerPickerFieldProps = { field: any; disabled: boolean };

export function StickerPickerField(props: StickerPickerFieldProps) {
    const { field, disabled } = props;
    const [anchorEl, setAnchorEl] = React.useState(null);
    const { t } = useTranslation();

    const stickers = [
        StickerType.Like,
        StickerType.Dislike,
        StickerType.CheckYes,
        StickerType.CheckNo,
        StickerType.Trophy,
        StickerType.Heart,
        StickerType.Smile,
        StickerType.Cool,
        StickerType.Hmm,
        StickerType.Sad,
        StickerType.FacePalm,
        StickerType.Puke,
    ];

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleChange = (sticker: StickerType | null) => {
        field.onChange({
            target: { value: sticker },
        });
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    const renderPlaceholder = () =>
        !disabled ? (
            <Tooltip title={t("submission:stickerTooltip")!}>
                <IconButton onClick={handleClick} size="large">
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            border: "2px dashed #ccc",
                            borderRadius: "50%",
                            width: "100px",
                            height: "100px",
                        }}
                    >
                        <EmojiEventsIcon
                            sx={{ fontSize: "48px", color: "#ccc" }}
                        />
                    </Box>
                </IconButton>
            </Tooltip>
        ) : (
            <IconButton disabled size="large">
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "2px dashed #ccc",
                        borderRadius: "50%",
                        width: "100px",
                        height: "100px",
                    }}
                >
                    <EmojiEventsIcon sx={{ fontSize: "48px", color: "#ccc" }} />
                </Box>
            </IconButton>
        );

    return (
        <Box
            sx={{
                position: "relative",
                overflow: "hidden",
                width: "124px",
                height: "124px",
            }}
        >
            {/* Either show sticker or a placeholder */}
            {field.value ? (
                <Sticker
                    type={field.value}
                    style={{ padding: 12, width: 124 }}
                />
            ) : (
                renderPlaceholder()
            )}
            {/* Overlay with delete button */}
            {field.value && !disabled && (
                <Grid
                    container
                    direction="column"
                    justifyContent="flex-end"
                    alignItems="center"
                    sx={{
                        background: "rgba(0, 0, 0, 0.05)",
                        borderBottomLeftRadius: "100% 200%",
                        borderBottomRightRadius: "100% 200%",
                        borderBottomColor: "transparent",
                        borderLeftColor: "transparent",
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        padding: 0,
                        margin: "12px",
                        width: "100px",
                        height: "50px",
                        color: "white",
                        zIndex: 100,
                    }}
                >
                    <Grid item>
                        <Tooltip title={t("submission:stickerTooltipDelete")}>
                            <IconButton
                                color="inherit"
                                name="delete"
                                onClick={() => handleChange(null)}
                                size="large"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
            )}
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
                transformOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
            >
                <ImageList cols={3} rowHeight={74} style={{ width: 3 * 80 }}>
                    {stickers.map((sticker) => (
                        <ImageListItem key={`sticker_${sticker}`}>
                            <IconButton
                                onClick={() => handleChange(sticker)}
                                size="large"
                            >
                                <Sticker type={sticker} style={{ width: 50 }} />
                            </IconButton>
                        </ImageListItem>
                    ))}
                </ImageList>
            </Popover>
        </Box>
    );
}
