import {
    Divider,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import clsx from "clsx";
import { ProgrammingLanguage } from "core";
import { File } from "interface/File.interface";
import dynamic from "next/dynamic";
import React from "react";
import ReactMarkdown from "react-markdown";
import RehypeKatexPlugin from "rehype-katex";
import RemarkEmojiPlugin from "remark-emoji";
import RemarkGithubPlugin from "remark-gfm";
import RemarkMathPlugin from "remark-math";
import { ImageBox } from "ui/ImageBox";
import { ObjectViewerType } from "ui/object/ObjectViewerType";
import { CodeViewerInline } from "ui/code/CodeViewerInline";
import { translateLabel } from "ui/object/ObjectViewerFile";

const PREFIX = "Markdown";

const classes = {
    root: `${PREFIX}-root`,
    blockquote: `${PREFIX}-blockquote`,
};

const StyledReactMarkdown = styled(ReactMarkdown)(({ theme }) => {
    return {
        [`&.${classes.root}`]: {
            // Links
            "& a": {
                color: theme.palette.primary.main,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
            },
            // Lists
            "& li": {
                display: "list-item",
            },
            // Thematic breaks (hr)
            "& hr": {
                margin: theme.spacing(2) + "px 0",
            },
            // last child should not have bottom margin
            "& p:last-child": {
                marginBottom: 0,
            },
            // tab size should be 4 characters
            tabSize: 4,
            overflow: "auto",
        },
        // blockquote
        [`& .${classes.blockquote}`]: {
            borderLeft: `2px solid ${theme.palette.text.secondary}`,
            paddingLeft: theme.spacing(1),
            color: theme.palette.text.secondary,
            marginBottom: theme.spacing(2),
        },
    };
});

const MermaidViewer = dynamic(
    () => import("ui/MermaidViewer").then((mod) => mod.default),
    { ssr: false }
);
const CodeViewer = dynamic(() =>
    import("ui/code/CodeViewer").then((mod) => mod.default)
);
const ObjectViewerYaml = dynamic(() =>
    import("ui/object/ObjectViewerYaml").then((mod) => mod.default)
);

interface MarkDownProps {
    className?: string;
    dense?: boolean;
    linkTarget?: string;
    files?: File[];
    children?: string;
}

interface MarkdownRendererOptions {
    dense?: boolean;
    files?: File[];
    classes?: {
        blockquote?: any;
    };
}

const renderers = (options: MarkdownRendererOptions) => {
    const { dense, files = [] } = options;

    return {
        p: function p({ children }) {
            return dense ? (
                <Typography variant="body2">{children}</Typography>
            ) : (
                <Typography paragraph>{children}</Typography>
            );
        },

        h1: function h1(props) {
            return <Typography variant="h3" gutterBottom {...props} />;
        },

        h2: function h2(props) {
            return <Typography variant="h4" gutterBottom {...props} />;
        },

        h3: function h3(props) {
            return <Typography variant="h5" gutterBottom {...props} />;
        },

        h4: function h4(props) {
            return <Typography variant="h6" gutterBottom {...props} />;
        },

        h5: function h5(props) {
            return <Typography variant="h6" gutterBottom {...props} />;
        },

        h6: function h6(props) {
            return <Typography variant="h6" gutterBottom {...props} />;
        },

        blockquote: function blockquote({ children }) {
            return <div className={classes.blockquote}>{children}</div>;
        },

        li: function li({ children }) {
            return <Typography component="li">{children}</Typography>;
        },

        hr: function hr() {
            return <Divider component="hr" />;
        },

        code: function code({ className = "", children = [], inline = false }) {
            const type = className.replace("language-", "").toLowerCase();
            const value = children.join();
            if (inline) {
                return <CodeViewerInline value={value} />;
            }
            if (type === "mermaid") {
                return <MermaidViewer chart={value.trim()} />;
            } else if (Object.keys(ObjectViewerType).includes(type)) {
                return (
                    <ObjectViewerYaml
                        __typename={type as ObjectViewerType}
                        files={files}
                        yaml={value}
                    />
                );
            } else {
                return (
                    <Stack spacing={2}>
                        <CodeViewer
                            value={value.trimEnd()}
                            language={type as ProgrammingLanguage}
                            style={dense ? undefined : { marginBottom: 16 }}
                        />
                    </Stack>
                );
            }
        },

        img: function img(props) {
            const options = { label: props.src, url: "" };
            // replace the label
            if (options.label) {
                Object.assign(options, translateLabel(options.label));
            }
            return <ImageBox {...options} />;
        },

        table: function table({ children }) {
            return <Table>{children}</Table>;
        },
        thead: function thead({ children }) {
            return <TableHead>{children}</TableHead>;
        },
        tbody: function tbody({ children }) {
            return <TableBody>{children}</TableBody>;
        },
        tr: function tr({ children }) {
            return <TableRow>{children}</TableRow>;
        },
        td: function td({ style = {}, children }) {
            return <TableCell style={style}>{children}</TableCell>;
        },
    };
};

export const Markdown = React.memo(
    (props: MarkDownProps) => {
        const {
            className,
            files,
            dense,
            linkTarget = "_blank",
            children,
        } = props;

        return (
            <StyledReactMarkdown
                className={clsx(classes.root, className)}
                linkTarget={linkTarget}
                components={renderers({
                    dense,
                    files,
                    classes,
                })}
                rehypePlugins={[RehypeKatexPlugin]}
                remarkPlugins={[
                    RemarkMathPlugin,
                    RemarkEmojiPlugin,
                    RemarkGithubPlugin,
                ]}
            >
                {children || ""}
            </StyledReactMarkdown>
        );
    },
    (prevProps, nextProps) => {
        if (prevProps.children !== nextProps.children) {
            return false;
        }
        return true;
    }
);

export default Markdown;
