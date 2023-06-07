import { Grid } from "@mui/material";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";
import { NumberFieldController } from "ui/form/NumberFieldController";
import { useUpdateMultipleChoices } from "./Question.data";

export interface PerAnswerChoiceFormProps {
    block: Block;
    assignment: Assignment;
}

export const PerAnswerChoiceForm = (props: PerAnswerChoiceFormProps) => {
    const { block, assignment } = props;
    const { t } = useTranslation();
    const { showSuccessToast } = useToast();
    const [updateMultipleChoices] = useUpdateMultipleChoices();

    const module = assignment?.module;
    const course = module?.course;

    const onSave = async (input) => {
        await updateMultipleChoices({
            variables: {
                blockId: block?.id,
                input,
            },
        });
        showSuccessToast();
    };

    const { control } = useAutosaveForm({
        onSave,
        defaultValues: {
            ...block.choices[0],
        },
    });
    return (
        <Grid container spacing={1}>
            <Grid item>
                <NumberFieldController
                    control={control}
                    name="correctScore"
                    label={t("assignment:correctScore")}
                    required
                    variant="outlined"
                    disabled={course?.archived}
                />
            </Grid>
            <Grid item>
                <NumberFieldController
                    control={control}
                    name="wrongScore"
                    label={t("assignment:wrongScore")}
                    required
                    variant="outlined"
                    disabled={course?.archived}
                />
            </Grid>
        </Grid>
    );
};
