import { Typography } from "@mui/material";
import { Url } from "core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IFrameBox } from "ui/IFrameBox";
import { BaseObjectViewerProps } from "./ObjectViewer";

export type ObjectViewerGoogleSheetsProps = BaseObjectViewerProps & {
    url?: string;
    id?: string;
    shape?: string;
    headers?: boolean;
    tabs?: boolean;
};

export function ObjectViewerGoogleSheets(props: ObjectViewerGoogleSheetsProps) {
    const {
        url = "",
        id = "",
        shape = "square",
        headers = false,
        tabs = false,
        ...rest
    } = props;
    const { t } = useTranslation();

    const googleSheetsId = useMemo(() => {
        if (id) {
            return id;
        }
        // extract the id from the url
        const match = url.match(/^.*\/(.*)\/pubhtml(.*)/);
        return match?.length >= 2 ? match[1] : "";
    }, [url, id]);

    if (!googleSheetsId) {
        return (
            <Typography color="error">
                {t("googleSheetsRenderError")}
            </Typography>
        );
    }

    const googleSheetsUrl = new Url(
        `https://docs.google.com/spreadsheets/d/e/${googleSheetsId}/pubhtml`,
        {
            chrome: false,
            headers,
            widget: tabs,
        }
    );

    return (
        <IFrameBox url={googleSheetsUrl.toString()} shape={shape} {...rest} />
    );
}
