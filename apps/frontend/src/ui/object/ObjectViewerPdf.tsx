import { Url } from "core";
import { useMemo } from "react";
import { IFrameBox } from "ui/IFrameBox";
import { BaseObjectViewerProps } from "./ObjectViewer";
import { translateLabel } from "./ObjectViewerFile";

export type ObjectViewerPdfProps = BaseObjectViewerProps & {
    label?: string;
    url?: string;
    page?: number;
    toolbar?: boolean;
    statusbar?: boolean;
    zoom?: string;
    shape?: string;
};

export function ObjectViewerPdf(props: ObjectViewerPdfProps) {
    const {
        label,
        page = 1,
        toolbar = true,
        statusbar = true,
        zoom,
        files,
        url: urlProp,
        ...rest
    } = props;

    const { url } = useMemo(() => {
        if (urlProp) {
            return { url: urlProp };
        } else if (label) {
            return translateLabel(label, files);
        } else {
            return { url: "" };
        }
    }, [urlProp, label, files]);

    const pdfUrl = new Url(url);
    pdfUrl.hash = Url.constructQueryString({
        page,
        toolbar: toolbar ? 1 : 0,
        statusbar: statusbar ? 1 : 0,
        zoom,
    });

    return <IFrameBox {...rest} url={pdfUrl.toString(false)} />;
}
