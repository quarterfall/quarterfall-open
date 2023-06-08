import { MenuItem, Stack } from "@mui/material";
import { ProgrammingLanguage } from "core";
import { useUpdateBlock } from "features/assignment/staff/api/Assignment.data";
import { useToast } from "hooks/useToast";
import {
    Block,
    setLastUsedProgrammingLanguage,
} from "interface/Block.interface";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";
import { CodeEditorController } from "ui/form/CodeEditorController";
import { SelectController } from "ui/form/SelectController";
const MarkdownFieldController = dynamic(() =>
    import("ui/form/MarkdownFieldController").then(
        (mod) => mod.MarkdownFieldController
    )
);

export interface EditCodeQuestionFormProps {
    block: Block;
}

export function EditCodeQuestionForm(props: EditCodeQuestionFormProps) {
    const { block } = props;
    const { t } = useTranslation();
    const [updateBlockMutation] = useUpdateBlock();
    const { showSuccessToast } = useToast();

    const defaultValues = {
        ...block,
        programmingLanguage:
            block.programmingLanguage || ProgrammingLanguage.other,
    };

    // Form
    const { control, reset } = useAutosaveForm<Block>({
        defaultValues,
        onSave: async (input) => {
            if (input.programmingLanguage) {
                // store the last used programming language in session storage
                setLastUsedProgrammingLanguage(input.programmingLanguage);
            }
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
                {/* Programming language */}
                <SelectController
                    style={{ minWidth: 200 }}
                    displayEmpty
                    label={t("programmingLanguage")}
                    name="programmingLanguage"
                    variant="outlined"
                    control={control}
                >
                    {Object.keys(ProgrammingLanguage).map((key) => {
                        return (
                            <MenuItem
                                key={key}
                                value={ProgrammingLanguage[key]}
                            >
                                {t(
                                    `programmingLanguage_${ProgrammingLanguage[key]}`
                                )}
                            </MenuItem>
                        );
                    })}
                </SelectController>
                {/* Question template input */}
                <CodeEditorController
                    label={t("assignment:questionTemplate")}
                    language={block.programmingLanguage}
                    name="template"
                    control={control}
                />
            </Stack>
        </form>
    );
}
