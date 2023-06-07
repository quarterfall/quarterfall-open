import { Typography } from "@mui/material";
import { Url } from "core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IFrameBox } from "ui/IFrameBox";
import { BaseObjectViewerProps } from "./ObjectViewer";

const speeds = {
    slow: 20000,
    medium: 10000,
    fast: 5000,
};

export type ObjectViewerGoogleSlidesProps = BaseObjectViewerProps & {
    url?: string;
    id?: string;
    shape?: string;
    autoplay?: boolean;
    loop?: boolean;
    speed?: number | string;
};

export function ObjectViewerGoogleSlides(props: ObjectViewerGoogleSlidesProps) {
    const {
        url = "",
        id = "",
        shape = "square",
        autoplay = false,
        loop = false,
        ...rest
    } = props;
    const { t } = useTranslation();

    const googleSlidesId = useMemo(() => {
        if (id) {
            return id;
        }
        // extract the id from the url
        const match = url.match(/^.*\/(.*)\/pub(.*)/);
        return match?.length >= 2 ? match[1] : "";
    }, [url, id]);

    if (!googleSlidesId) {
        return (
            <Typography color="error">
                {t("googleSlidesRenderError")}
            </Typography>
        );
    }

    const speed = Number(props.speed) || speeds[props.speed] || speeds.medium;
    const googleSlidesUrl = new Url(
        `https://docs.google.com/presentation/d/e/${googleSlidesId}/embed`,
        {
            start: autoplay,
            loop,
            delayms: speed,
        }
    );

    return (
        <IFrameBox url={googleSlidesUrl.toString()} shape={shape} {...rest} />
    );
}
