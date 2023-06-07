import { Typography } from "@mui/material";
import { AxiosResponse } from "axios";
import { ProgrammingLanguage } from "core";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BaseObjectViewerProps } from "./ObjectViewer";
import { translateLabel } from "./ObjectViewerFile";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));
const CodeViewer = dynamic(() => import("ui/code/CodeViewer"));

export type ObjectViewerTextProps = BaseObjectViewerProps & {
    label?: string;
    url?: string;
};

export function detectProgrammingLanguage(
    filename: string
): ProgrammingLanguage {
    if (filename.endsWith(".js")) {
        return ProgrammingLanguage.javascript;
    } else if (filename.endsWith(".cpp") || filename.endsWith(".hpp")) {
        return ProgrammingLanguage.cpp;
    } else if (filename.endsWith(".c") || filename.endsWith(".h")) {
        return ProgrammingLanguage.c;
    } else if (filename.endsWith(".py")) {
        return ProgrammingLanguage.python;
    } else if (filename.endsWith(".java")) {
        return ProgrammingLanguage.java;
    } else if (filename.endsWith(".cs")) {
        return ProgrammingLanguage.csharp;
    } else if (filename.endsWith(".go")) {
        return ProgrammingLanguage.go;
    } else if (filename.endsWith(".html") || filename.endsWith(".xml")) {
        return ProgrammingLanguage.markup;
    } else if (filename.endsWith(".css")) {
        return ProgrammingLanguage.css;
    } else if (filename.endsWith(".json")) {
        return ProgrammingLanguage.json;
    } else {
        return ProgrammingLanguage.other;
    }
}

async function loadTextFile(url: string): Promise<string> {
    const Axios = (await import("axios")).default;
    const result = await Axios.get<unknown, AxiosResponse<string>>(url);
    if (typeof result.data !== "string") {
        result.data = JSON.stringify(result.data, null, 2);
    }
    return result.data;
}

export function ObjectViewerText(props: ObjectViewerTextProps) {
    const { label, files, url: urlProp } = props;
    const [text, setText] = useState("");
    const { t } = useTranslation();

    const { url } = useMemo(() => {
        if (urlProp) {
            return { url: urlProp };
        } else if (label) {
            return translateLabel(label, files);
        } else {
            return { url: "" };
        }
    }, [label, urlProp, files]);

    useEffect(() => {
        if (
            !String(url).startsWith("http://") &&
            !String(url).startsWith("https://")
        ) {
            return;
        }
        // retrieve the text file on mount
        loadTextFile(url).then((result) => {
            setText(result);
        });
    }, [url]);

    if (
        !String(url).startsWith("http://") &&
        !String(url).startsWith("https://")
    ) {
        return <Typography color="error">{t("textRenderError")}</Typography>;
    }

    // determine the programming language
    const programmingLanguage = detectProgrammingLanguage(url);

    if (url.endsWith(".markdown") || url.endsWith(".md")) {
        return <Markdown files={files}>{text}</Markdown>;
    }

    return <CodeViewer value={text} language={programmingLanguage} />;
}
