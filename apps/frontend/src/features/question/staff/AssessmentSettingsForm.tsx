import { Grid, MenuItem } from "@mui/material";
import { useUpdateBlock } from "features/assignment/staff/api/Assignment.data";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";
import { NumberFieldController } from "ui/form/NumberFieldController";
import { SelectController } from "ui/form/SelectController";
import { SwitchController } from "ui/form/SwitchController";
const MarkdownFieldController = dynamic(() =>
    import("ui/form/MarkdownFieldController").then(
        (mod) => mod.MarkdownFieldController
    )
);

export interface AssessmentSettingsFormProps {
    block: Block;
    assignment: Assignment;
    readOnly: boolean;
}

export const AssessmentSettingsForm = (props: AssessmentSettingsFormProps) => {
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
        <form>
            <Grid container spacing={2} direction="column">
                <Grid container item spacing={1}>
                    <Grid item>
                        <NumberFieldController
                            control={control}
                            name="weight"
                            variant="outlined"
                            label={t("assignment:weight")}
                            required
                            style={{ width: 150 }}
                            controllerProps={{
                                rules: {
                                    min: 1,
                                },
                            }}
                            disabled={course?.archived || readOnly}
                        />
                    </Grid>
                    <Grid item>
                        <SelectController
                            control={control}
                            displayEmpty
                            fullWidth
                            style={{ width: 120 }}
                            name="granularity"
                            variant="outlined"
                            label={t("assignment:granularity")}
                            disabled={course?.archived || readOnly}
                        >
                            <MenuItem value={1}>1</MenuItem>
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={100}>100</MenuItem>
                        </SelectController>
                    </Grid>
                    <Grid item>
                        <SwitchController
                            control={control}
                            name="hasRangeLimit"
                            label={t("assignment:limitRange")}
                            labelPlacement="start"
                            disabled={course?.archived || readOnly}
                        />
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <MarkdownFieldController
                        control={control}
                        name="criteriaText"
                        fullWidth
                        variant="outlined"
                        label={t("assignment:criteriaText")}
                        multiline
                        disabled={course?.archived || readOnly}
                    />
                </Grid>
            </Grid>
        </form>
    );
};
