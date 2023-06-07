import { Stack } from "@mui/material";
import { ProgrammingLanguage } from "core";
import { useUpdateBlock } from "features/assignment/staff/api/Assignment.data";
import { useToast } from "hooks/useToast";
import { Block } from "interface/Block.interface";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";
import { CodeEditorController } from "ui/form/CodeEditorController";
const MarkdownFieldController = dynamic(() =>
    import("ui/form/MarkdownFieldController").then(
        (mod) => mod.MarkdownFieldController
    )
);

export interface EditDatabaseQuestionFormProps {
    block: Block;
}

export function EditDatabaseQuestionForm(props: EditDatabaseQuestionFormProps) {
    const { block } = props;
    const { t } = useTranslation();
    const [updateBlockMutation] = useUpdateBlock();
    const { showSuccessToast } = useToast();

    const defaultValues = {
        ...block,
    };

    // Form
    const { control, reset } = useAutosaveForm<Block>({
        defaultValues,
        onSave: async (input) => {
            await updateBlockMutation({
                variables: {
                    id: block.id,
                    input,
                },
            });
            showSuccessToast();
        },
    });

    useEffect(() => {
        reset(defaultValues);
    }, [block.id]);

    return (
        <form>
            <Stack alignItems="flex-start" spacing={2}>
                {/* Question text input */}
                <MarkdownFieldController
                    fullWidth
                    multiline
                    minRows={3}
                    maxRows={Infinity}
                    variant="outlined"
                    label={t("assignment:questionText")}
                    name="text"
                    control={control}
                />
                {/* Question template input */}
                <CodeEditorController
                    label={t("assignment:questionTemplate")}
                    language={ProgrammingLanguage.sql}
                    name="template"
                    control={control}
                />
            </Stack>
        </form>
    );
}
