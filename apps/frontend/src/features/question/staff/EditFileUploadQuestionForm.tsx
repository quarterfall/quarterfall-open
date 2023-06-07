import { Stack } from "@mui/material";
import { useUpdateBlock } from "features/assignment/staff/api/Assignment.data";
import { useToast } from "hooks/useToast";
import { Block } from "interface/Block.interface";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";
import { TextFieldController } from "ui/form/TextFieldController";
const MarkdownFieldController = dynamic(() =>
    import("ui/form/MarkdownFieldController").then(
        (mod) => mod.MarkdownFieldController
    )
);

interface EditFileUploadQuestionFormProps {
    block: Block;
}

export const EditFileUploadQuestionForm = (
    props: EditFileUploadQuestionFormProps
) => {
    const { block } = props;
    const { t } = useTranslation();
    const [updateBlockMutation] = useUpdateBlock();
    const { showSuccessToast } = useToast();

    const defaultValues = {
        text: block?.text,
        allowedFileExtensions: block?.allowedFileExtensions || "",
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
            <MarkdownFieldController
                fullWidth
                multiline
                minRows={3}
                maxRows={Infinity}
                label={t("assignment:textBlock")}
                name="text"
                control={control}
            />

            <TextFieldController
                control={control}
                name="allowedFileExtensions"
                fullWidth
                variant="outlined"
                label={t("assignment:allowedFileExtensions")}
            />
        </Stack>
    );
};
