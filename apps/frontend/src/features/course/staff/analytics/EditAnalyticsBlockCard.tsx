import { Stack } from "@mui/material";
import { useToast } from "hooks/useToast";
import { AnalyticsBlock } from "interface/AnalyticsBlock.interface";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";
import { CodeEditorController } from "ui/form/CodeEditorController";
import { TextFieldController } from "ui/form/TextFieldController";
export interface AnalyticsBlockEditorProps {
    disabled?: boolean;
    analyticsBlock: AnalyticsBlock;
    onChange: (data: Partial<AnalyticsBlock>) => void;
}

export function EditAnalyticsBlockCard(props: AnalyticsBlockEditorProps) {
    const { disabled, analyticsBlock, onChange } = props;
    const { t } = useTranslation();
    const { showSuccessToast } = useToast();

    // Form for the analytics editor
    const { control } = useAutosaveForm<Partial<AnalyticsBlock>>({
        defaultValues: {
            ...analyticsBlock,
            title: t(analyticsBlock.title),
        },
        onSave: async (input: Partial<AnalyticsBlock>) => {
            onChange(input);
            showSuccessToast();
        },
    });

    return (
        <Stack spacing={2}>
            {/* Title */}
            <TextFieldController
                fullWidth
                label={t("title")}
                name="title"
                control={control}
                required
                disabled={disabled}
            />
            <CodeEditorController
                label={t("analytics:blockCode")}
                language="javascript"
                name="code"
                control={control}
                disabled={disabled}
            />
        </Stack>
    );
}
