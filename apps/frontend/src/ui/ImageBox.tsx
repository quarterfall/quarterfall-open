import { Box, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export interface ImageBoxProps {
    url: string;
    shape?: string;
    border?: string;
    size?: string;
    position?: "left" | "center" | "right";
    fit?: "fill" | "contain" | "cover" | "none" | "scale-down";
    wideShapeRatio?: number;
    tallShapeRatio?: number;
}

export function ImageBox(props: ImageBoxProps) {
    const {
        url = "",
        shape = "original",
        border = "false",
        size = "original",
        position = "center",
        fit = "fill",
        wideShapeRatio = 16 / 9,
        tallShapeRatio = 9 / 16,
    } = props;

    const { t } = useTranslation();
    const ref = useRef(null);
    const imgRef = React.useRef(null);
    const [boxWidth, setBoxWidth] = useState(0);
    const [boxHeight, setBoxHeight] = useState(0);
    const [totalWidth, setTotalWidth] = useState(0);
    const [imageWidth, setImageWidth] = useState(0);

    const handleImageLoad = () => {
        if (imgRef?.current) {
            // store the image width
            setImageWidth(imgRef.current.naturalWidth);
        }
    };

    const handleResize = () => {
        if (ref?.current) {
            // store the total width
            setTotalWidth(ref.current.offsetWidth);
        }
    };

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        // make sure the sizes are initialized
        handleImageLoad();
        handleResize();
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // recompute the size if the image width or the total width changes
    useEffect(() => {
        // determine the image width
        const sizeStr = String(size) || "";
        let widthStr = String(size) || "original";
        let height = -1;
        if (sizeStr === "large") {
            widthStr = "100%";
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

        // compute the desired image width
        let finalBoxWidth = 0;
        if (widthStr.endsWith("%")) {
            // set the width as a percentage of the total width
            const percSize = Math.max(
                Math.min(Number(widthStr.slice(0, -1).trim()), 100),
                0
            );
            finalBoxWidth = (percSize * totalWidth) / 100;
        } else if (!isNaN(Number(widthStr))) {
            finalBoxWidth = Math.min(Number(widthStr), totalWidth);
        } else {
            // set the width to be the original width
            finalBoxWidth = Math.min(imageWidth, totalWidth);
        }
        // adapt the height according to the shape if needed
        if (shape === "wide") {
            height = finalBoxWidth / wideShapeRatio;
        } else if (shape === "square") {
            height = finalBoxWidth;
        } else if (shape === "tall") {
            height = finalBoxWidth / tallShapeRatio;
        }

        setBoxWidth(finalBoxWidth);
        setBoxHeight(height);
    }, [imageWidth, totalWidth]);

    if (
        !String(url).startsWith("http://") &&
        !String(url).startsWith("https://")
    ) {
        return <Typography color="error">{t("imageRenderError")}</Typography>;
    }

    return (
        <Box
            component="span"
            ref={ref}
            sx={{
                display: "flex",
                marginBottom: 2,
                width: "100%",
                ...(position === "left"
                    ? { justifyContent: "flex-start" }
                    : { justifyContent: "flex-end" }),
                justifyContent:
                    position === "left"
                        ? "flex-start"
                        : position === "right"
                        ? "flex-end"
                        : "center",
            }}
        >
            <Box
                component="img"
                sx={{
                    maxWidth: "100%",
                    height: "100%",
                    display: "block",
                    objectFit: "cover",
                    ...(border === "true" && {
                        border: "2px solid",
                        borderColor: "action.disabled",
                    }),
                }}
                src={url}
                ref={imgRef}
                onLoad={handleImageLoad}
                style={{
                    width: boxWidth,
                    height: boxHeight !== -1 ? boxHeight : undefined,
                    objectFit: fit,
                }}
            />
        </Box>
    );
}
