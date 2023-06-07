import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import Rating, { RatingProps } from "@mui/material/Rating";
import { generateId } from "core";
import StarOffIcon from "mdi-material-ui/StarOff";
import React from "react";
import { useTranslation } from "react-i18next";

export type LabeledRatingProps = RatingProps & {
    ratingLabel?: (rating: number) => string;
    legend?: string;
    tooltipTitle?: (rating: number) => string;
    ratingLabelPlacement?: "start" | "end";
};

export function LabeledRating(props: LabeledRatingProps) {
    const {
        legend,
        ratingLabel,
        tooltipTitle,
        ratingLabelPlacement = "end",
        disabled,
        value,
        readOnly,
        onChange,
        name,
        ...rest
    } = props;
    const { t } = useTranslation();

    const [hover, setHover] = React.useState(-1);
    let label;
    if (ratingLabel) {
        if (hover !== -1) {
            label = ratingLabel(hover);
        } else if (value > 0) {
            label = ratingLabel(value);
        }
    }
    let title;
    if (tooltipTitle) {
        if (hover !== -1) {
            title = tooltipTitle(hover);
        } else if (value > 0) {
            title = tooltipTitle(value);
        }
    }

    const handleClearRating = (event) => {
        if (onChange) {
            onChange(event, null);
        }
    };

    return (
        <>
            {legend && <Typography component="legend">{legend}</Typography>}
            <Box sx={{ display: "flex", alignItems: "center" }}>
                {ratingLabelPlacement === "start" && label && (
                    <Box mr={1}>{label}</Box>
                )}
                {!disabled && !readOnly && (
                    <Tooltip title={t("assignment:clearRating")}>
                        <span>
                            <IconButton
                                onClick={handleClearRating}
                                size="small"
                                disabled={!value}
                                sx={{ marginRight: 1 }}
                            >
                                <StarOffIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                )}
                <Tooltip title={title || ""}>
                    <Rating
                        name={name || generateId()}
                        value={value || 0}
                        disabled={disabled}
                        readOnly={readOnly}
                        onChange={onChange}
                        onChangeActive={(event, newHover) => {
                            setHover(newHover);
                        }}
                        /* sx={{
                            "& .MuiRating-iconFilled": {
                                color: "primary.light",
                            },
                            "& .MuiRating-iconHover": {
                                color: "primary.main",
                            },
                        }} */
                        {...rest}
                    />
                </Tooltip>
                {ratingLabelPlacement === "end" && label && (
                    <Box ml={1}>{label}</Box>
                )}
            </Box>
        </>
    );
}
