import { Typography } from "@mui/material";
import { Url } from "core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IFrameBox } from "ui/IFrameBox";
import { BaseObjectViewerProps } from "./ObjectViewer";

export type ObjectViewerDailymotionProps = BaseObjectViewerProps & {
    url?: string;
    id?: string;
    autoplay?: boolean;
    loop?: boolean;
    controls?: boolean;
};

export function ObjectViewerDailymotion(props: ObjectViewerDailymotionProps) {
    const {
        url = "",
        id = "",
        autoplay = false,
        loop = false,
        controls = true,
        ...rest
    } = props;
    const { t, i18n } = useTranslation();

    const videoId = useMemo(() => {
        if (id) {
            return id;
        }
        const match = url.match(/^.*\/([^#\&\?]*).*/);
        return match?.length >= 2 ? match[1] : "";
    }, [url, id]);

    if (!videoId) {
        return (
            <Typography color="error">{t("dailymotionRenderError")}</Typography>
        );
    }

    const dailymotionUrl = new Url(
        `https://www.dailymotion.com/embed/video/${videoId}`,
        {
            autoplay,
            loop,
            controls,
            "ui-logo": false,
            "ui-start-screen-info": false,
        }
    );

    return (
        <IFrameBox
            url={dailymotionUrl.toString()}
            {...rest}
            wideShapeRatio={16 / 9}
            tallShapeRatio={9 / 16}
        />
    );
}
