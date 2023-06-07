import { Stack, Typography } from "@mui/material";
import { File } from "interface/File.interface";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { BaseObjectViewerProps } from "./ObjectViewer";
import { ObjectViewerButton } from "./ObjectViewerButton";
import { ObjectViewerImage } from "./ObjectViewerImage";
import { ObjectViewerPdf } from "./ObjectViewerPdf";
import { ObjectViewerText } from "./ObjectViewerText";

export type ObjectViewerFileProps = BaseObjectViewerProps & {
    url?: string;
    label?: string;
    hasDownloadButton?: boolean;
};

export function translateLabel(label: string, files?: File[]) {
    return (
        (files || []).find((file) => file?.label === label) || {
            mimetype: "",
            url: label,
        }
    );
}

export function ObjectViewerFile(props: ObjectViewerFileProps) {
    const { label, files, url: urlProp, hasDownloadButton = false } = props;
    const { t } = useTranslation();

    const { url, mimetype } = useMemo(() => {
        if (urlProp) {
            return { url: urlProp, mimetype: "" };
        } else if (label) {
            return translateLabel(label, files);
        } else {
            return { url: "", mimetype: "" };
        }
    }, [label, urlProp, files]);

    const isPdf = () => {
        return mimetype === "application/pdf";
    };
    const isImage = () => {
        return mimetype.startsWith("image");
    };
    const isText = () => {
        return mimetype.startsWith("text") || mimetype === "application/json";
    };

    const canBeDisplayed = isPdf() || isImage() || isText();

    const renderFile = () => {
        if (isPdf()) {
            return <ObjectViewerPdf url={url} {...props} />;
        } else if (isImage()) {
            return <ObjectViewerImage url={url} {...props} />;
        } else if (isText()) {
            return <ObjectViewerText url={url} {...props} />;
        } else {
            return hasDownloadButton ? (
                <Typography align="center">
                    {t("assignment:downloadFileMessage")}
                </Typography>
            ) : (
                <Typography color="error">{t("cannotPreviewFile")}</Typography>
            );
        }
    };

    return (
        <Stack spacing={2}>
            {renderFile()}
            {hasDownloadButton && (
                <ObjectViewerButton
                    url={url}
                    files={files}
                    position={canBeDisplayed ? "right" : "center"}
                    text={t("download")}
                />
            )}
        </Stack>
    );
}
