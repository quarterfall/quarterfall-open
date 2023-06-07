import { MenuItem, Stack } from "@mui/material";
import { EditorType } from "core";
import { useUpdateBlock } from "features/assignment/staff/api/Assignment.data";
import { useToast } from "hooks/useToast";
import { Block } from "interface/Block.interface";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";
import { SelectController } from "ui/form/SelectController";
import { TextFieldController } from "ui/form/TextFieldController";
const MarkdownFieldController = dynamic(() =>
    import("ui/form/MarkdownFieldController").then(
        (mod) => mod.MarkdownFieldController
    )
);

export interface EditOpenQuestionFormProps {
    block: Block;
    showSolution?: boolean;
}

export function EditOpenQuestionForm(props: EditOpenQuestionFormProps) {
    const { block, showSolution } = props;
    const { t } = useTranslation();
    const [updateBlockMutation] = useUpdateBlock();
    const { showSuccessToast } = useToast();

    const defaultValues = {
        ...block,
        editor: block.editor || EditorType.Text,
    };

    // Form for the assignment editor
    const { control, reset } = useAutosaveForm({
        onSave: async (input) => {
            await updateBlockMutation({
                variables: {
                    id: block.id,
                    input,
                },
            });
            showSuccessToast();
        },
        defaultValues,
    });

    useEffect(() => {
        reset(defaultValues);
    }, [block.id]);

    return (
        <Stack spacing={2} alignItems="flex-start">
            {/* Question text input */}
            <MarkdownFieldController
                fullWidth
                multiline
                minRows={3}
                maxRows={Infinity}
                label={t("assignment:questionText")}
                name="text"
                control={control}
            />
            {/* Question type selection */}
            <SelectController
                style={{ minWidth: 200 }}
                label={t("assignment:chooseEditor")}
                name="editor"
                variant="outlined"
                control={control}
            >
                {Object.keys(EditorType).map((key) => {
                    return (
                        <MenuItem key={key} value={EditorType[key]}>
                            {t(`assignment:editor_${EditorType[key]}`)}
                        </MenuItem>
                    );
                })}
            </SelectController>
            {/* Question template input */}
            <TextFieldController
                fullWidth
                multiline
                minRows={3}
                maxRows={Infinity}
                label={t("assignment:questionTemplate")}
                name="template"
                control={control}
            />
            {/* Question solution input */}
            {showSolution && (
                <MarkdownFieldController
                    fullWidth
                    multiline
                    minRows={3}
                    maxRows={Infinity}
                    label={t("solution")}
                    name="solution"
                    control={control}
                />
            )}
        </Stack>
    );
}
