import { Box, Paper, Theme } from "@mui/material";
import { PaperProps } from "@mui/material/Paper";
import {
    ProgrammingLanguage,
    supportedLanguagesSyntaxHighlighting,
} from "core";
import Prism from "prismjs";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-css";
import "prismjs/components/prism-go";
import "prismjs/components/prism-haskell";
import "prismjs/components/prism-java";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-python";
import "prismjs/components/prism-r";
import "prismjs/components/prism-sql";
import React from "react";

const languageMap = {
    [ProgrammingLanguage.c]: Prism.languages.c,
    [ProgrammingLanguage.cpp]: Prism.languages.cpp,
    [ProgrammingLanguage.csharp]: Prism.languages.csharp,
    [ProgrammingLanguage.css]: Prism.languages.css,
    [ProgrammingLanguage.go]: Prism.languages.go,
    [ProgrammingLanguage.haskell]: Prism.languages.haskell,
    [ProgrammingLanguage.markup]: Prism.languages.markup,
    [ProgrammingLanguage.java]: Prism.languages.java,
    [ProgrammingLanguage.javascript]: Prism.languages.javascript,
    [ProgrammingLanguage.json]: Prism.languages.json,
    [ProgrammingLanguage.python]: Prism.languages.python,
    [ProgrammingLanguage.sql]: Prism.languages.sql,
    [ProgrammingLanguage.r]: Prism.languages.r,
};

export const highlight = (
    code: string,
    programmingLanguage?: ProgrammingLanguage
): string => {
    if (
        programmingLanguage &&
        supportedLanguagesSyntaxHighlighting.indexOf(programmingLanguage) >= 0
    ) {
        return Prism.highlight(
            code || "",
            languageMap[programmingLanguage || ProgrammingLanguage.javascript]
        );
    } else {
        return code;
    }
};

const fontStyle = {
    fontSize: "14px",
    fontFamily: '"Fira Mono", monospace',
};

export type CodeViewerProps = PaperProps & {
    value: string;
    language?: ProgrammingLanguage;
    inline?: boolean;
    hideLineNumbers?: boolean;
};

export function CodeViewer(props: CodeViewerProps) {
    const {
        value = "",
        language,
        inline,
        hideLineNumbers = false,
        elevation = 0,
        square = true,
        ...rest
    } = props;

    // render the code inline
    const renderInline = () => {
        if (
            !language ||
            supportedLanguagesSyntaxHighlighting.indexOf(language) == -1
        ) {
            return (
                <Box
                    component="span"
                    sx={{ padding: 0, margin: 0, ...fontStyle }}
                >
                    {value}
                </Box>
            );
        } else
            return (
                <Box
                    component="span"
                    sx={(theme: Theme) => ({
                        padding: 0,
                        margin: 0,
                        [theme.breakpoints.down("md")]: {
                            paddingBottom: 2,
                        },
                        ...fontStyle,
                    })}
                    dangerouslySetInnerHTML={{
                        __html: highlight(value, language),
                    }}
                />
            );
    };

    // render the code as a block
    const renderCodeBlock = () => {
        if (
            !language ||
            supportedLanguagesSyntaxHighlighting.indexOf(language) == -1
        ) {
            return (
                <Box
                    component="span"
                    sx={{ padding: 0, margin: 0, ...fontStyle }}
                >
                    {value}
                </Box>
            );
        } else
            return (
                <Box
                    component="pre"
                    sx={{ padding: 0, margin: 0, ...fontStyle }}
                    dangerouslySetInnerHTML={{
                        __html: highlight(value, language),
                    }}
                />
            );
    };

    const renderBlock = () => {
        // count the number of lines
        const lines = (value || "").trim().split(/\r\n|\r|\n/);

        return (
            <Paper
                sx={{
                    display: "flex",
                    marginBottom: 0.5,
                    maxWidth: "100%",
                    overflow: "hidden",
                    backgroundColor: "transparent",
                    border: "none",
                }}
                elevation={elevation}
                square={square}
                {...rest}
            >
                {!hideLineNumbers &&
                    lines.length > 1 &&
                    language &&
                    supportedLanguagesSyntaxHighlighting.indexOf(language) >=
                        0 && (
                        <Box
                            sx={{
                                minWidth: 23,
                                color: "action.disabled",
                                textAlign: "right",
                                userSelect: "none",
                                marginRight: 3,
                                ...fontStyle,
                            }}
                        >
                            {lines.map((line, index) => {
                                const lineNumber = String(index + 1);
                                return (
                                    <React.Fragment key={index}>
                                        {lineNumber}
                                        <br />
                                    </React.Fragment>
                                );
                            })}
                        </Box>
                    )}

                <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                    {renderCodeBlock()}
                </Box>
            </Paper>
        );
    };

    return inline ? renderInline() : renderBlock();
}

export default CodeViewer;
