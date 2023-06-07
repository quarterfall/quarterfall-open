import { Box, RatingProps, Tooltip } from "@mui/material";
import Rating from "@mui/material/Rating";
import React from "react";
import { useTranslation } from "react-i18next";

export interface DifficultyRatingProps extends RatingProps {
    difficulty?: number;
}

export function DifficultyRating(props: DifficultyRatingProps) {
    const { difficulty = 0, sx: extraStyles, ...rest } = props;
    const { t } = useTranslation();

    // do not render a rating for difficulty 0
    if (difficulty === 0) {
        return null;
    }

    return (
        <Tooltip title={t(`assignment:tooltipDifficulty_${difficulty}`)!}>
            <Box>
                <Rating
                    value={difficulty}
                    max={5}
                    readOnly
                    size="small"
                    sx={{
                        color: "secondary.main",
                        display: "flex",
                        marginRight: 1,
                        ...extraStyles,
                    }}
                    {...rest}
                />
            </Box>
        </Tooltip>
    );
}
