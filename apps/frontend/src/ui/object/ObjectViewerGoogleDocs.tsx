import { Typography } from "@mui/material";
import { Url } from "core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IFrameBox } from "ui/IFrameBox";
import { BaseObjectViewerProps } from "./ObjectViewer";

export type ObjectViewerGoogleDocsProps = BaseObjectViewerProps & {
    url?: string;
    id?: string;
    shape?: string;
};

export function ObjectViewerGoogleDocs(props: ObjectViewerGoogleDocsProps) {
    const { url = "", id = "", shape = "square", ...rest } = props;
    const { t } = useTranslation();

    const googleDocsId = useMemo(() => {
        if (id) {
            return id;
        }
        // extract the id from the url
        const match = url.match(/^.*\/(.*)\/pub(.*)/);
        return match?.length >= 2 ? match[1] : "";
    }, [url, id]);

    if (!googleDocsId) {
        return (
            <Typography color="error">{t("googleDocsRenderError")}</Typography>
        );
    }

    const googleDocsUrl = new Url(
        `https://docs.google.com/document/d/e/${googleDocsId}/pub`,
        {
            embedded: true,
        }
    );

    return <IFrameBox url={googleDocsUrl.toString()} shape={shape} {...rest} />;
}
