import React, { useMemo } from "react";
import { ImageBox } from "ui/ImageBox";
import { BaseObjectViewerProps } from "./ObjectViewer";
import { translateLabel } from "./ObjectViewerFile";

export type ObjectViewerImageProps = BaseObjectViewerProps & {
    label?: string;
    url?: string;
    shape?: string;
    border?: string;
    size?: string;
    position?: "left" | "center" | "right";
    fit?: "fill" | "contain" | "cover" | "none" | "scale-down";
    wideShapeRatio?: number;
    tallShapeRatio?: number;
};

export function ObjectViewerImage(props: ObjectViewerImageProps) {
    const { label, files, url: urlProp, ...rest } = props;

    const urlData = useMemo(() => {
        if (urlProp) {
            return { url: urlProp };
        } else if (label) {
            return translateLabel(label, files);
        } else {
            return { url: "", mimetype: "" };
        }
    }, [label, urlProp, files]);

    return <ImageBox {...rest} {...urlData} />;
}
