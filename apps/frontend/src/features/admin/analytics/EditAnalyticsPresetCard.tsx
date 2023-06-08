import { Grid, MenuItem } from "@mui/material";
import { AnalyticsType } from "core";
import { useToast } from "hooks/useToast";
import { AnalyticsBlock } from "interface/AnalyticsBlock.interface";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";
import { CodeEditorController } from "ui/form/CodeEditorController";
import { SelectController } from "ui/form/SelectController";
import { SwitchController } from "ui/form/SwitchController";
import { TextFieldController } from "ui/form/TextFieldController";
import { useUpdateAnalyticsBlockPreset } from "./AnalyticsPresets.data";

interface AnalyticsFormData {
    title: string;
    code: string;
    type: AnalyticsType;
}

export interface AnalyticsBlockEditorProps {
    analyticsBlock: AnalyticsBlock;
    onComputeAnalytics: () => void;
}

export function EditAnalyticsPresetCard(props: AnalyticsBlockEditorProps) {
    const { analyticsBlock, onComputeAnalytics } = props;
    const { t } = useTranslation();
    const { showSuccessToast } = useToast();
    const [updateAnalyticsBlockPresetMutation] =
        useUpdateAnalyticsBlockPreset();

    const presetTypes = [
        AnalyticsType.organization,
        AnalyticsType.course,
        AnalyticsType.assignment,
        AnalyticsType.student,
    ];

    // Form for the analytics editor
    const {
        formState: { errors },
        control,
    } = useAutosaveForm<AnalyticsFormData>({
        defaultValues: analyticsBlock,
        onSave: async (input) => {
            await updateAnalyticsBlockPresetMutation({
                variables: {
                    id: analyticsBlock.id,
                    input,
                },
            });
            if (input.code !== undefined) {
                onComputeAnalytics();
            }
            showSuccessToast();
        },
    });

    return (
        <Grid
            container
            direction="column"
            style={{ marginTop: 10 }}
            spacing={2}
        >
            <Grid item>
                {/* Preset title */}
                <TextFieldController
                    fullWidth
                    label={t("analytics:presetName")}
                    name="presetName"
                    control={control}
                    required
                />
            </Grid>
            <Grid item>
                {/* Title */}
                <TextFieldController
                    fullWidth
                    label={t("title")}
                    name="title"
                    control={control}
                    required
                />
            </Grid>
            <Grid item>
                {/* Analytics code */}
                <CodeEditorController
                    label={t("analytics:blockCode")}
                    language="javascript"
                    name="code"
                    control={control}
                />
            </Grid>
            <Grid item>
                {/* Analytics type */}
                <SelectController
                    displayEmpty
                    label={t("analytics:type")}
                    name="type"
                    control={control}
                    required
                    variant="outlined"
                >
                    {presetTypes.map((key) => {
                        return (
                            <MenuItem key={key} value={AnalyticsType[key]}>
                                {t(`analytics:type_${AnalyticsType[key]}`)}
                            </MenuItem>
                        );
                    })}
                </SelectController>
            </Grid>
            <Grid item>
                <SwitchController
                    label={t("published")}
                    name="published"
                    control={control}
                />
            </Grid>
            <Grid item>
                <SwitchController
                    label={t("analytics:fullWidth")}
                    name="fullWidth"
                    control={control}
                />
            </Grid>
        </Grid>
    );
}
