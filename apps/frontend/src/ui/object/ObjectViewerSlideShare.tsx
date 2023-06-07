import { Typography } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IFrameBox } from "ui/IFrameBox";
import { BaseObjectViewerProps } from "./ObjectViewer";

export type ObjectViewerSlideShareProps = BaseObjectViewerProps & {
    url?: string;
    id?: string;
};

export function ObjectViewerSlideShare(props: ObjectViewerSlideShareProps) {
    const { url = "", id = "", ...rest } = props;
    const { t } = useTranslation();

    const slideShareId = useMemo(() => {
        if (id) {
            return id;
        }
        // extract the id from the url
        const match = url.match(/^.*\/([^#\&\?]*).*/);
        return match?.length >= 2 ? match[1] : "";
    }, [url, id]);

    if (!slideShareId) {
        return (
            <Typography color="error">{t("slideShareRenderError")}</Typography>
        );
    }

    return (
        <IFrameBox
            url={`https://www.slideshare.net/slideshow/embed_code/key/${slideShareId}`}
            {...rest}
        />
    );
}
