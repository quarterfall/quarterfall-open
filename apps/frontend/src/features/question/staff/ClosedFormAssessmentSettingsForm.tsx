import { Alert, MenuItem, Stack } from "@mui/material";
import { AssessmentMethod, BlockType } from "core";
import { useUpdateBlock } from "features/assignment/staff/api/Assignment.data";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { useTranslation } from "react-i18next";
import { DividerText } from "ui/DividerText";
import { useAutosaveForm } from "ui/form/Autosave";
import { SelectController } from "ui/form/SelectController";
import { PerAnswerChoiceForm } from "./PerAnswerChoiceForm";
import { ScoreMappingChoiceForm } from "./ScoreMappingChoiceForm";

export interface ClosedFormAssessmentSettingsFormProps {
    block: Block;
    assignment: Assignment;
    readOnly: boolean;
}

export const ClosedFormAssessmentSettingsForm = (
    props: ClosedFormAssessmentSettingsFormProps
) => {
    const { block, assignment, readOnly } = props;
    const { t } = useTranslation();
    const { showSuccessToast } = useToast();
    const [updateBlockMutation] = useUpdateBlock();

    const module = assignment?.module;
    const course = module?.course;

    const onSave = async (input) => {
        await updateBlockMutation({
            variables: {
                id: block.id,
                input,
            },
        });
        showSuccessToast();
    };
    const defaultValues = { ...block };

    const { control } = useAutosaveForm<Partial<Block>>({
        onSave,
        defaultValues,
    });

    return (
        <Stack spacing={2}>
            {block.type === BlockType.MultipleChoiceQuestion &&
                block?.choices?.length > 1 && (
                    <>
                        <DividerText
                            text={t("assignment:closedFormSettings")}
                        />

                        <SelectController
                            style={{ width: 200 }}
                            displayEmpty
                            fullWidth
                            label={t("assignment:assessmentMethod")}
                            name="assessmentMethod"
                            variant="outlined"
                            control={control}
                            disabled={course?.archived || readOnly}
                        >
                            {Object.keys(AssessmentMethod).map((key) => {
                                return (
                                    <MenuItem
                                        key={key}
                                        value={AssessmentMethod[key]}
                                    >
                                        {t(
                                            `assignment:assessmentMethod_${AssessmentMethod[key]}`
                                        )}
                                    </MenuItem>
                                );
                            })}
                        </SelectController>
                        <Alert severity="info">
                            {t(
                                `assignment:${
                                    AssessmentMethod[block?.assessmentMethod]
                                }Info`
                            )}
                        </Alert>
                    </>
                )}
            {block?.assessmentMethod === AssessmentMethod.perAnswer && (
                <PerAnswerChoiceForm block={block} assignment={assignment} />
            )}
            {block?.assessmentMethod === AssessmentMethod.scoreMapping && (
                <Stack spacing={2}>
                    {block.choices.map((choice, index) => {
                        return (
                            <Stack
                                key={`choice_${index}`}
                                direction="row"
                                spacing={1}
                                style={{ width: "100%", paddingLeft: -8 }}
                            >
                                <ScoreMappingChoiceForm
                                    choice={choice}
                                    block={block}
                                    assignment={assignment}
                                />
                            </Stack>
                        );
                    })}
                </Stack>
            )}
        </Stack>
    );
};
