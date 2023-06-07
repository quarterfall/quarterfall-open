import AddIcon from "@mui/icons-material/Add";
import { Button, Stack } from "@mui/material";
import { useUpdateBlock } from "features/assignment/staff/api/Assignment.data";
import { useToast } from "hooks/useToast";
import { Block } from "interface/Block.interface";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { useAutosaveForm } from "ui/form/Autosave";
import { SwitchController } from "ui/form/SwitchController";
import { EditChoices } from "./EditChoices";
import { useAddChoice } from "./Question.data";

const MarkdownFieldController = dynamic(() =>
    import("ui/form/MarkdownFieldController").then(
        (mod) => mod.MarkdownFieldController
    )
);

export interface EditMultipleChoiceQuestionFormProps {
    block: Block;
    showSolution?: boolean;
}

export function EditMultipleChoiceQuestionForm(
    props: EditMultipleChoiceQuestionFormProps
) {
    const { block, showSolution } = props;
    const { t } = useTranslation();
    const [addChoiceMutation] = useAddChoice();
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

    const addChoice = () => {
        // generate a choice label
        const existingLabels = (block.choices || [])
            .filter((choice) => choice.label)
            .map((choice) => choice.label);
        let label;
        let index = 65;
        while (
            index < 91 &&
            existingLabels.indexOf(String.fromCharCode(index)) >= 0
        ) {
            index += 1;
        }
        if (index < 91) {
            label = String.fromCharCode(index);
        }

        addChoiceMutation({
            variables: {
                blockId: block.id,
                input: {
                    label,
                },
            },
        });
    };

    useEffect(() => {
        reset(block);
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
            <Align right>
                <SwitchController
                    label={t("assignment:multipleCorrectLabel")}
                    labelPlacement="start"
                    name="multipleCorrect"
                    control={control}
                />
            </Align>
            {/* Choices */}
            <EditChoices block={block} />
            <Align right>
                <Button onClick={addChoice} startIcon={<AddIcon />}>
                    {t("assignment:addChoice")}
                </Button>
            </Align>
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
