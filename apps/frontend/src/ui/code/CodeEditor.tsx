import Editor, { EditorProps, Monaco } from "@monaco-editor/react";
import {
    Box,
    CircularProgress,
    darken,
    FormHelperText,
    lighten,
    Stack,
    styled,
    useTheme,
} from "@mui/material";
import Color from "color";
import { editor } from "monaco-editor";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { OutlinedDiv } from "ui/OutlinedDiv";

const EXTRA_HEIGHT = 10;

const PREFIX = "Editor";

const classes = {
    root: `${PREFIX}-root`,
};

const StyledBox = styled(Box)(({ theme }) => ({
    [`& .${classes.root}`]: {
        borderRadius: `${theme.shape.borderRadius}px`,
    },
}));

export type CodeEditorProps = EditorProps & {
    fixedHeight?: boolean;
    minHeight?: number;
    maxHeight?: number;
    label?: string;
    disabled?: boolean;
    required?: boolean;
    error?: boolean;
    helperText?: ReactNode;
    autoFocus?: boolean;
    resetToTemplateButton?: ReactNode;
};

export function CodeEditor(props: CodeEditorProps) {
    const {
        fixedHeight = false,
        minHeight = 100,
        maxHeight = 500,
        label,
        disabled = false,
        required = false,
        error = false,
        onMount,
        onChange,
        value,
        helperText,
        autoFocus,
        resetToTemplateButton,
        ...rest
    } = props;
    const theme = useTheme();
    const editorRef = useRef(null);
    const [containerHeight, setContainerHeight] = useState(minHeight);
    const [focused, setFocused] = useState(autoFocus);

    useEffect(() => {
        updateHeight();
    }, [value]);

    const updateHeight = () => {
        if (!editorRef.current) {
            return;
        }
        const height = Math.max(
            minHeight,
            Math.min(
                editorRef.current.getContentHeight() + EXTRA_HEIGHT,
                maxHeight
            )
        );
        if (height !== containerHeight) {
            setContainerHeight(height);
            editorRef.current.layout({
                width: editorRef.current.getLayoutInfo().width,
                height,
            });
        }
    };

    const options: editor.IStandaloneEditorConstructionOptions = Object.assign(
        {
            minimap: {
                enabled: false,
            },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: '"Fira Mono", monospace',
            lineNumbersMinChars: 2,
            readOnly: disabled,
            scrollbar: {
                alwaysConsumeMouseWheel: false,
            },
        },
        props.options
    );

    const handleMount = useCallback(
        (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
            editorRef.current = editor;
            if (autoFocus) {
                editorRef.current.focus();
            }
            if (theme.palette.mode === "dark") {
                monaco.editor.defineTheme("qf-dark", {
                    base: "vs-dark",
                    inherit: true,
                    colors: {
                        "editor.background": Color(
                            lighten(theme.palette.background.paper, 0.15)
                        ).hex(),
                        "editor.lineHighlightBackground": Color(
                            lighten(theme.palette.background.paper, 0.15)
                        ).hex(),
                    },
                    rules: [],
                });
                monaco.editor.setTheme("qf-dark");
            } else {
                monaco.editor.defineTheme("qf-light", {
                    base: "vs",
                    inherit: true,
                    colors: {
                        "editor.background": Color(
                            darken(theme.palette.background.paper, 0.07)
                        ).hex(),
                    },
                    rules: [],
                });
                monaco.editor.setTheme("qf-light");
            }
            // The options prop on the Editor causes render issues so we set it here.
            editor.updateOptions(options);
            // The fonts need to be remeasured for Windows OS
            document.fonts.ready.then(() => {
                monaco.editor.remeasureFonts();
            });
            updateHeight();
            if (onMount) {
                onMount(editor, monaco);
            }
        },
        [editorRef.current]
    );

    return (
        <>
            <OutlinedDiv
                variant="outlined"
                label={label}
                required={required}
                sx={{
                    width: "100%",
                    cursor: "text",
                    backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                            ? lighten(theme.palette.background.paper, 0.15)
                            : darken(theme.palette.background.paper, 0.07),
                    borderRadius: `${theme.shape.borderRadius}px`,
                    "& .MuiOutlinedInput-root": {
                        paddingX: 1,
                        paddingY: 2,
                    },
                }}
                onClick={() => {
                    if (focused) {
                        return;
                    }
                    editorRef.current.focus();
                    setFocused(true);
                }}
                onBlur={() => setFocused(false)}
            >
                <Box
                    sx={{
                        width: "100%",
                        position: "relative",
                        height: fixedHeight ? "100%" : containerHeight,
                        borderRadius: `${theme.shape.borderRadius}px`,
                    }}
                >
                    <StyledBox
                        sx={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            borderRadius: `${theme.shape.borderRadius}px`,
                        }}
                    >
                        <Editor
                            onChange={onChange}
                            onMount={handleMount}
                            value={value}
                            theme={
                                theme.palette.mode == "dark"
                                    ? "qf-dark"
                                    : "qf-light"
                            }
                            className={classes.root}
                            width="100%"
                            height="100%"
                            loading={
                                <Box
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <CircularProgress color="secondary" />
                                </Box>
                            }
                            {...rest}
                        />
                    </StyledBox>
                </Box>
            </OutlinedDiv>
            {helperText && (
                <FormHelperText
                    variant="outlined"
                    component="div"
                    error={error}
                >
                    {helperText}
                </FormHelperText>
            )}
            <Stack direction="row" justifyContent="space-between" width="100%">
                {resetToTemplateButton}
            </Stack>
        </>
    );
}
