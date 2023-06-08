import { Typography } from "@mui/material";
import { Url } from "core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IFrameBox } from "ui/IFrameBox";
import { BaseObjectViewerProps } from "./ObjectViewer";

export type ObjectViewerVimeoProps = BaseObjectViewerProps & {
    url?: string;
    id?: string;
    autoplay?: boolean;
    loop?: boolean;
    controls?: boolean;
};

export function ObjectViewerVimeo(props: ObjectViewerVimeoProps) {
    const {
        url = "",
        id = "",
        autoplay = false,
        loop = false,
        controls = true,
        ...rest
    } = props;
    const { t } = useTranslation();

    const videoId = useMemo(() => {
        if (id) {
            return id;
        }
        const match = url.match(/^.*\/([^#\&\?]*).*/);
        return match?.length >= 2 ? match[1] : "";
    }, [url, id]);

    if (!videoId) {
        return <Typography color="error">{t("vimeoRenderError")}</Typography>;
    }

    const vimeoUrl = new Url(`https://player.vimeo.com/video/${videoId}`, {
        autoplay: autoplay ? 1 : 0,
        loop: loop ? 1 : 0,
        controls: controls ? 1 : 0,
    });

    return (
        <IFrameBox
            url={vimeoUrl.toString()}
            {...rest}
            wideShapeRatio={16 / 9}
            tallShapeRatio={9 / 16}
        />
    );
}
