import { Rating, RatingProps, Typography } from "@mui/material";
import isNumber from "lodash/isNumber";
import { useTranslation } from "react-i18next";
import { BaseObjectViewerProps } from "./ObjectViewer";

export type ObjectViewerRatingProps = BaseObjectViewerProps & RatingProps;

export function ObjectViewerRating(props: ObjectViewerRatingProps) {
    const {
        value,
        max = 5,
        size = "small",
        precision = 0.1,
        files,
        ...rest
    } = props;
    const { t } = useTranslation();

    if (!isNumber(value || 0)) {
        return (
            <Typography color="error">
                {t("analytics:unknownRatingValue")}
            </Typography>
        );
    } else {
        return (
            <Rating
                value={value || 0}
                max={max}
                size={size}
                precision={precision}
                {...rest}
                readOnly
            />
        );
    }
}
