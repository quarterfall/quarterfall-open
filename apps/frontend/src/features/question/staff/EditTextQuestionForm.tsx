import { Stack } from "@mui/material";
import { useUpdateBlock } from "features/assignment/staff/api/Assignment.data";
import { useToast } from "hooks/useToast";
import { Block } from "interface/Block.interface";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";
const MarkdownFieldController = dynamic(() =>
    import("ui/form/MarkdownFieldController").then(
        (mod) => mod.MarkdownFieldController
    )
);

export interface EditTextQuestionFormProps {
    block: Block;
}

export function EditTextQuestionForm(props: EditTextQuestionFormProps) {
    const { block } = props;
    const { t } = useTranslation();
    const [updateBlockMutation] = useUpdateBlock();
    const { showSuccessToast } = useToast();

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
        defaultValues: { ...block },
    });

    useEffect(() => {
        reset(block);
    }, [block.id]);

    return (
        <Stack spacing={1} alignItems="flex-start">
            <MarkdownFieldController
                fullWidth
                multiline
                minRows={3}
                maxRows={Infinity}
                label={t("assignment:textBlock")}
                name="text"
                control={control}
            />
        </Stack>
    );
}
