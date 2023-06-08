import { Checkbox, Radio } from "@mui/material";
import { patterns } from "core";
import { useToast } from "hooks/useToast";
import { Choice } from "interface/Choice.interface";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";
import { TextFieldController } from "ui/form/TextFieldController";
import { useUpdateChoice } from "./Question.data";

const MarkdownFieldController = dynamic(() =>
    import("ui/form/MarkdownFieldController").then(
        (mod) => mod.MarkdownFieldController
    )
);

export interface EditChoiceProps {
    blockId: string;
    choice: Choice;
    index: number;
    multipleCorrect?: boolean;
}

export function EditChoice(props: EditChoiceProps) {
    const { blockId, choice, index, multipleCorrect } = props;
    const [updateChoiceMutation] = useUpdateChoice();
    const { t } = useTranslation();
    const { showSuccessToast } = useToast();

    // Form for the choice editor
    const { control } = useAutosaveForm({
        onSave: async (input) => {
            await updateChoiceMutation({
                variables: {
                    blockId,
                    choiceId: choice.id,
                    input,
                },
            });
            showSuccessToast();
        },
        defaultValues: { ...choice },
    });

    return (
        <>
            {!multipleCorrect && (
                <Radio
                    color="primary"
                    sx={{ width: "53px", height: "53px" }}
                    checked={choice.correct}
                    onClick={(evt) => {
                        updateChoiceMutation({
                            variables: {
                                blockId,
                                choiceId: choice.id,
                                input: { correct: true },
                            },
                        });
                        showSuccessToast();
                    }}
                />
            )}
            {multipleCorrect && (
                <Checkbox
                    color="primary"
                    sx={{ width: "53px", height: "53px" }}
                    checked={choice.correct}
                    onChange={(evt) => {
                        updateChoiceMutation({
                            variables: {
                                blockId,
                                choiceId: choice.id,
                                input: { correct: evt.target.checked },
                            },
                        });
                        showSuccessToast();
                    }}
                />
            )}
            <TextFieldController
                sx={{ width: "120px", marginRight: 1 }}
                InputProps={{
                    sx: {
                        fontFamily: '"Fira Mono", monospace',
                        fontSize: "14px",
                    },
                }}
                label={t("assignment:choiceLabel")}
                name="label"
                control={control}
                controllerProps={{
                    rules: {
                        pattern: {
                            value: patterns.variable,
                            message: t("validationErrorInvalidLabel"),
                        },
                    },
                }}
            />
            <MarkdownFieldController
                sx={{ flexGrow: 1 }}
                label={`${t("assignment:choice")} ${index + 1}`}
                multiline
                name="text"
                control={control}
            />
        </>
    );
}
