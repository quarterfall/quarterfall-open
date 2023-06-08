import { Typography } from "@mui/material";
import { Url } from "core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IFrameBox } from "ui/IFrameBox";
import { BaseObjectViewerProps } from "./ObjectViewer";

export type ObjectViewerYouTubeProps = BaseObjectViewerProps & {
    url?: string;
    id?: string;
    autoplay?: boolean;
    loop?: boolean;
    controls?: boolean;
};

export function ObjectViewerYouTube(props: ObjectViewerYouTubeProps) {
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
        const match: RegExpMatchArray | [] = url
            ? url.match(
                  /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/
              )
            : [];
        return match?.length >= 3 ? match[2] : "";
    }, [url, id]);

    if (!videoId) {
        return <Typography color="error">{t("youtubeRenderError")}</Typography>;
    }
    const youTubeUrl = new Url(`https://www.youtube.com/embed/${videoId}`, {
        modestbranding: 1,
        rel: 0,
        autoplay: autoplay ? 1 : 0,
        loop: loop ? 1 : 0,
        controls: controls ? 1 : 0,
        hl: i18n.language,
    });

    return (
        <IFrameBox
            url={youTubeUrl.toString()}
            {...rest}
            wideShapeRatio={16 / 9}
            tallShapeRatio={9 / 16}
        />
    );
}
