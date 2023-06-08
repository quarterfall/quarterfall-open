import PreviewIcon from "@mui/icons-material/Visibility";
import {
    Box,
    Button,
    Stack,
    styled,
    TextField,
    TextFieldProps,
    Typography,
} from "@mui/material";
import dynamic from "next/dynamic";
import { ReactNode, useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { PoweredByMarkdownButton } from "ui/markdown/PoweredByMarkdownButton";
import { OutlinedDiv } from "ui/OutlinedDiv";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));

const KEYCODE_ENTER = 13;
const KEYCODE_TAB = 9;
const KEYCODE_BACKSPACE = 8;

interface Record {
    value: any;
    selectionStart: number;
    selectionEnd: number;
}

type MarkdownFieldProps = TextFieldProps & {
    showPreviewToggle?: boolean;
    action?: ReactNode;
};
const PREFIX = "Markdown";

const classes = {
    root: `${PREFIX}-root`,
};

const StyledBox = styled(Box)(({ theme }) => ({
    [`& .${classes.root}`]: {
        minHeight: 87,
    },
}));

export function MarkdownField(props: MarkdownFieldProps) {
    const { onChange, showPreviewToggle = false, action, ...rest } = props;

    const { t } = useTranslation();

    const [isEditMode, setIsEditMode] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);

    const updateInput = (record: Record) => {
        const input = inputRef.current;

        // update values and selection state
        if (input) {
            input.value = record.value;
            input.selectionStart = record.selectionStart;
            input.selectionEnd = record.selectionEnd;
        }
        if (onChange) {
            onChange({ target: record } as any);
        }
    };

    const getLines = (text: string, position: number) =>
        text.substring(0, position).split("\n");

    const handleKeyDown = (e) => {
        const { value, selectionStart, selectionEnd } = e.target;

        const tabSize = 4;
        const insertSpaces = false;
        const tabCharacter = insertSpaces ? " ".repeat(tabSize) : "\t";

        if (e.keyCode === KEYCODE_TAB) {
            // Prevent focus change
            e.preventDefault();

            if (e.shiftKey) {
                // Unindent selected lines
                const linesBeforeCaret = getLines(value, selectionStart);
                const startLine = linesBeforeCaret.length - 1;
                const endLine = getLines(value, selectionEnd).length - 1;
                const nextValue = value
                    .split("\n")
                    .map((line, i) => {
                        if (
                            i >= startLine &&
                            i <= endLine &&
                            line.startsWith(tabCharacter)
                        ) {
                            return line.substring(tabCharacter.length);
                        }

                        return line;
                    })
                    .join("\n");

                if (value !== nextValue) {
                    const startLineText = linesBeforeCaret[startLine];

                    updateInput({
                        value: nextValue,
                        // Move the start cursor if first line in selection was modified
                        // It was modified only if it started with a tab
                        selectionStart: startLineText.startsWith(tabCharacter)
                            ? selectionStart - tabCharacter.length
                            : selectionStart,
                        // Move the end cursor by total number of characters removed
                        selectionEnd:
                            selectionEnd - (value.length - nextValue.length),
                    });
                }
            } else if (selectionStart !== selectionEnd) {
                // Indent selected lines
                const linesBeforeCaret = getLines(value, selectionStart);
                const startLine = linesBeforeCaret.length - 1;
                const endLine = getLines(value, selectionEnd).length - 1;
                const startLineText = linesBeforeCaret[startLine];

                updateInput({
                    value: value
                        .split("\n")
                        .map((line, i) => {
                            if (i >= startLine && i <= endLine) {
                                return tabCharacter + line;
                            }
                            return line;
                        })
                        .join("\n"),
                    // Move the start cursor by number of characters added in first line of selection
                    // Don't move it if it there was no text before cursor
                    selectionStart: /\S/.test(startLineText)
                        ? selectionStart + tabCharacter.length
                        : selectionStart,
                    // Move the end cursor by total number of characters added
                    selectionEnd:
                        selectionEnd +
                        tabCharacter.length * (endLine - startLine + 1),
                });
            } else {
                const updatedSelection = selectionStart + tabCharacter.length;

                updateInput({
                    // Insert tab character at caret
                    value:
                        value.substring(0, selectionStart) +
                        tabCharacter +
                        value.substring(selectionEnd),
                    // Update caret position
                    selectionStart: updatedSelection,
                    selectionEnd: updatedSelection,
                });
            }
        } else if (e.keyCode === KEYCODE_BACKSPACE) {
            const hasSelection = selectionStart !== selectionEnd;
            const textBeforeCaret = value.substring(0, selectionStart);

            if (textBeforeCaret.endsWith(tabCharacter) && !hasSelection) {
                // Prevent default delete behaviour
                e.preventDefault();

                const updatedSelection = selectionStart - tabCharacter.length;

                updateInput({
                    // Remove tab character at caret
                    value:
                        value.substring(
                            0,
                            selectionStart - tabCharacter.length
                        ) + value.substring(selectionEnd),
                    // Update caret position
                    selectionStart: updatedSelection,
                    selectionEnd: updatedSelection,
                });
            }
        } else if (e.keyCode === KEYCODE_ENTER) {
            // Ignore selections
            if (selectionStart === selectionEnd) {
                // Get the current line
                const line = getLines(value, selectionStart).pop();
                const matches = line?.match(/^\s+/);

                // add an extra indent if line ends with {[(
                const trimmedLine = line?.trim() || "";
                let extraIndent = "";
                if (
                    trimmedLine.endsWith("{") ||
                    trimmedLine.endsWith("[") ||
                    trimmedLine.endsWith("(")
                ) {
                    extraIndent = tabCharacter;
                }

                if ((matches && matches[0]) || extraIndent) {
                    e.preventDefault();

                    // Preserve indentation on inserting a new line
                    let indent = "\n" + extraIndent;
                    if (matches && matches[0]) {
                        indent += matches[0];
                    }
                    const updatedSelection = selectionStart + indent.length;

                    updateInput({
                        // Insert indentation character at caret
                        value:
                            value.substring(0, selectionStart) +
                            indent +
                            value.substring(selectionEnd),
                        // Update caret position
                        selectionStart: updatedSelection,
                        selectionEnd: updatedSelection,
                    });
                }
            }
        }
    };

    const handleClickEdit = () => {
        setIsEditMode(true);
        setTimeout(() => {
            const input = inputRef.current;
            const end = input.value.length;
            input.setSelectionRange(end, end);
            input.focus();
        }, 100);
    };

    const renderEndAdornment = useCallback(() => {
        return (
            <Button
                size="small"
                onClick={() => setIsEditMode(false)}
                startIcon={<PreviewIcon fontSize="small" />}
            >
                {t("showPreview")}
            </Button>
        );
    }, [isEditMode])();

    const renderPreview = useCallback(() => {
        return (
            <StyledBox>
                {props.value ? (
                    <Markdown className="hello" files={[]}>
                        {props.value as string}
                    </Markdown>
                ) : (
                    <Box sx={{ width: "100%", height: "88px" }} />
                )}
            </StyledBox>
        );
    }, [props.value])();

    return (
        <Stack width="100%">
            {!!showPreviewToggle && !isEditMode ? (
                <OutlinedDiv
                    label={props.label}
                    InputProps={{
                        sx: {
                            alignItems: "flex-start",
                        },
                    }}
                    onClick={handleClickEdit}
                    shrink={!!props.value}
                    tooltipTitle={<Typography>{t("clickToEdit")}</Typography>}
                >
                    {renderPreview}
                </OutlinedDiv>
            ) : (
                <Box
                    sx={{
                        position: "relative",
                        "& #endAdornment": {
                            visibility: "hidden",
                        },
                        "&:hover #endAdornment": {
                            visibility: "visible",
                        },
                    }}
                >
                    <TextField
                        onKeyDown={handleKeyDown}
                        inputRef={inputRef}
                        onChange={onChange}
                        InputProps={{
                            sx: {
                                fontFamily: '"Fira Mono", monospace',
                                fontSize: 14,
                                tabSize: 4,
                                ...(showPreviewToggle && {
                                    minHeight: 120,
                                }),
                            },
                        }}
                        {...rest}
                    />
                    {showPreviewToggle && isEditMode && (
                        <Box
                            sx={(theme) => ({
                                position: "absolute",
                                right: theme.spacing(1),
                                top: theme.spacing(1),
                                background: theme.palette.background.paper,
                                borderRadius: `${theme.shape.borderRadius}px`,
                            })}
                            id="endAdornment"
                        >
                            {renderEndAdornment}
                        </Box>
                    )}
                </Box>
            )}
            {showPreviewToggle && (
                <Stack
                    direction="row-reverse"
                    justifyContent="space-between"
                    marginTop={0.25}
                >
                    <PoweredByMarkdownButton />
                    {action}
                </Stack>
            )}
        </Stack>
    );
}
