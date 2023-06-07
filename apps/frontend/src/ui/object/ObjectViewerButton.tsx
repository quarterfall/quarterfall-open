import DownloadIcon from "@mui/icons-material/GetApp";
import { Box, Button, Typography } from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { BaseObjectViewerProps } from "./ObjectViewer";
import { translateLabel } from "./ObjectViewerFile";

export type ObjectViewerButtonProps = BaseObjectViewerProps & {
    type?: string;
    url?: string;
    label?: string;
    text?: string;
    position?: "center" | "left" | "right";
};

export function ObjectViewerButton(props: ObjectViewerButtonProps) {
    const {
        type = "download",
        text,
        label,
        files,
        position = "center",
        url: urlProp,
    } = props;
    const { t } = useTranslation();

    const { url } = useMemo(() => {
        if (urlProp) {
            return { url: urlProp };
        } else if (label) {
            return translateLabel(label, files);
        } else {
            return { url: "" };
        }
    }, [urlProp, files, label]);

    if (
        !String(url).startsWith("http://") &&
        !String(url).startsWith("https://")
    ) {
        return (
            <Typography color="error">
                {t("downloadButtonRenderError")}
            </Typography>
        );
    }

    const onClickDownloadFile = async () => {
        const Axios = (await import("axios")).default;
        const file = (files || []).find((f) => f.url === url);
        Axios.get(url, {
            responseType: "blob",
        }).then((res) => {
            const fileUrl = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = fileUrl;
            link.setAttribute("download", file?.label + file?.extension);
            document.body.appendChild(link);
            link.click();
        });
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                ...(position === "left" && {
                    justifyContent: "flex-start",
                }),
                ...(position === "right" && {
                    justifyContent: "flex-end",
                }),
            }}
        >
            <Button
                variant="contained"
                color="primary"
                onClick={onClickDownloadFile}
                startIcon={<DownloadIcon />}
            >
                {text || t("download")}
            </Button>
        </Box>
    );
}
