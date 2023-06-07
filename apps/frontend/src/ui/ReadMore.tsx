import { Box, Typography } from "@mui/material";
import { TypographyProps } from "@mui/material/Typography";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface ReadMoreProps {
    text: string;
    truncate?: "lines" | "characters";
    characters?: number;
    lines?: number;
    showReadMore?: boolean;
    classes?: any;
    typographyProps?: TypographyProps;
}

const lineHeight = 1.46429;
const lhUnit = "em";

export function ReadMore(props: ReadMoreProps) {
    const {
        truncate = "characters",
        text = "",
        characters = 300,
        lines = 3,
        showReadMore = true,
        typographyProps = {},
    } = props;

    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(
        truncate === "characters" && text.length <= characters
    );
    const [showButton, setShowButton] = useState(
        truncate === "characters" && text.length > characters
    );

    const textRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        if (truncate === "lines") {
            const overflowing =
                textRef?.current?.clientHeight < textRef?.current?.scrollHeight;
            setExpanded(!overflowing);
            setShowButton(overflowing && showReadMore);
        }
    }, []);

    const truncateText = (text: string): string => {
        // Strip whitespace
        text = text.replace(/\s+/g, " ");

        // Truncate
        if (characters < 0) {
            throw new RangeError(
                "Cannot truncate text to a negative number of characters."
            );
        }

        if (text.length > characters) {
            text = text.substr(0, characters);
            // Ellipsis
            text += "...";
        }

        return text;
    };

    const renderCharacterLimit = () => {
        return (
            <Typography {...typographyProps}>
                {truncateText(text)}
                {showButton && (
                    <Box
                        sx={{
                            cursor: "pointer",
                            fontWeight: 500,
                            "&:hover": {
                                color: "secondary.main",
                            },
                        }}
                        onClick={() => setExpanded(!expanded)}
                    >
                        {t("readMore")}
                    </Box>
                )}
            </Typography>
        );
    };

    const renderLineLimit = () => {
        const textStyles = {
            lineHeight: lineHeight + lhUnit,
            height: lineHeight * lines + lhUnit,
        };

        return (
            <>
                <>
                    <Typography
                        sx={{ overflow: "hidden" }}
                        style={textStyles}
                        {...typographyProps}
                    >
                        {text}
                    </Typography>
                </>
                {showButton && (
                    <Typography
                        onClick={() => setExpanded(!expanded)}
                        sx={{
                            cursor: "pointer",
                            fontWeight: 500,
                            "&:hover": {
                                color: "secondary.main",
                            },
                        }}
                    >
                        {t("readMore")}
                    </Typography>
                )}
            </>
        );
    };

    if (expanded) {
        return (
            <>
                <>
                    <Typography {...typographyProps}>{text}</Typography>
                </>
                {showButton && (
                    <Typography
                        onClick={() => setExpanded(!expanded)}
                        sx={{
                            cursor: "pointer",
                            fontWeight: 500,
                            "&:hover": {
                                color: "secondary.main",
                            },
                        }}
                    >
                        {t("readLess")}
                    </Typography>
                )}
            </>
        );
    } else {
        return truncate === "lines"
            ? renderLineLimit()
            : renderCharacterLimit();
    }
}
