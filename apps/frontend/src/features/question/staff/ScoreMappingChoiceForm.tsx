import { Grid, TextField } from "@mui/material";
import { Choice } from "core";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";
import { NumberFieldController } from "ui/form/NumberFieldController";
import { useUpdateChoice } from "./Question.data";

export interface ScoreMappingChoiceFormProps {
    choice: Choice;
    block: Block;
    assignment: Assignment;
}

export const ScoreMappingChoiceForm = (props: ScoreMappingChoiceFormProps) => {
    const { block, choice, assignment } = props;
    const { t } = useTranslation();
    const { showSuccessToast } = useToast();

    const module = assignment?.module;
    const course = module?.course;

    const [updateChoice] = useUpdateChoice();
    const defaultValues = {
        ...choice,
    };

    const onSave = async (input) => {
        await updateChoice({
            variables: {
                blockId: block?.id,
                choiceId: choice?.id,
                input,
            },
        });
        showSuccessToast();
    };

    const { control } = useAutosaveForm({
        defaultValues,
        onSave,
    });

    return (
        <>
            <TextField
                sx={{ width: "100px" }}
                InputProps={{
                    sx: {
                        fontFamily: '"Fira Mono", monospace',
                        fontSize: "14px",
                    },
                }}
                variant="outlined"
                label={t("assignment:choiceLabel")}
                name="label"
                value={choice?.label}
                disabled
            />

            <Grid item>
                <NumberFieldController
                    control={control}
                    name="correctScore"
                    label={t("assignment:selectedScore")}
                    required
                    variant="outlined"
                    sx={{ width: "200px" }}
                    disabled={course?.archived}
                />
            </Grid>
            <Grid item>
                <NumberFieldController
                    control={control}
                    name="wrongScore"
                    label={t("assignment:notSelectedScore")}
                    required
                    variant="outlined"
                    sx={{ width: "200px" }}
                    disabled={course?.archived}
                />
            </Grid>
        </>
    );
};
