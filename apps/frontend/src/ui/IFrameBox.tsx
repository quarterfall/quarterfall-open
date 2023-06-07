import { Box, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export interface IFrameBox {
    url: string;
    shape?: string;
    border?: string;
    size?: string;
    position?: "left" | "center" | "right";
    wideShapeRatio?: number;
    tallShapeRatio?: number;
}

export function IFrameBox(props: IFrameBox) {
    const {
        url = "",
        shape = "original",
        border = "false",
        size = "medium",
        position = "center",
        wideShapeRatio = 4 / 3,
        tallShapeRatio = 3 / 4,
    } = props;
    const { t } = useTranslation();
    const ref = useRef(null);
    const [boxWidth, setBoxWidth] = useState(0);
    const [boxHeight, setBoxHeight] = useState(0);

    const handleResize = () => {
        if (!ref || !ref.current) {
            return;
        }
        const sizeStr = String(size) || "medium";
        // compute the total width
        const totalWidth = ref.current.offsetWidth;

        let widthStr = String(size) || "large";
        let height = -1;
        if (sizeStr === "large") {
            widthStr = "99%";
        } else if (sizeStr === "medium") {
            widthStr = "66%";
        } else if (sizeStr === "small") {
            widthStr = "33%";
        } else if (sizeStr.includes("x") || sizeStr.includes("X")) {
            const sizeValues = sizeStr.toLowerCase().split("x");
            widthStr = sizeValues[0].trim();
            const parsedHeight = Number(sizeValues[1].trim());
            if (!isNaN(parsedHeight)) {
                height = parsedHeight;
            }
        }

        // compute the desired box width
        let finalBoxWidth = totalWidth;
        if (widthStr.endsWith("%")) {
            // set the width as a percentage of the total width
            const percSize = Math.max(
                Math.min(Number(widthStr.slice(0, -1).trim()), 100),
                0
            );
            finalBoxWidth = (percSize * totalWidth) / 100;
        } else if (!isNaN(Number(widthStr))) {
            finalBoxWidth = Math.min(Number(widthStr), totalWidth);
        }
        // adapt the height according to the shape
        if (shape === "square") {
            height = finalBoxWidth;
        } else if (shape === "tall") {
            height = finalBoxWidth / tallShapeRatio;
        }

        // finally, if height is not defined, use wide
        if (height === -1) {
            height = finalBoxWidth / wideShapeRatio;
        }
        setBoxWidth(finalBoxWidth);
        setBoxHeight(height);
    };
    useEffect(() => {
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return <Typography color="error">{t("iframeRenderError")}</Typography>;
    }

    return (
        <Box
            ref={ref}
            sx={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 2,
                ...(position === "left" && { justifyContent: "flex-start" }),
                ...(position === "right" && { justifyContent: "flex-end" }),
            }}
        >
            <Box
                component="iframe"
                src={url}
                sx={{
                    width: boxWidth,
                    height: boxHeight,
                    ...(border === "true" && {
                        border: "2px solid",
                        borderColor: (theme) => theme.palette.action.disabled,
                    }),
                }}
                allowFullScreen
                frameBorder="0"
            />
        </Box>
    );
}
