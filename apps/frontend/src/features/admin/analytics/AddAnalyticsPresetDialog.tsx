import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
    Typography,
} from "@mui/material";
import { AnalyticsType } from "core";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SelectController } from "ui/form/SelectController";
import { TextFieldController } from "ui/form/TextFieldController";
import { useAddAnalyticsBlockPreset } from "./AnalyticsPresets.data";

export interface AddAnalyticsPresetDialogProps {
    open?: boolean;
    onClose?: () => void;
}

export function AddAnalyticsPresetDialog(props: AddAnalyticsPresetDialogProps) {
    const { t } = useTranslation();
    const [addAnalyticsBlockPreset] = useAddAnalyticsBlockPreset();

    const { open = false, onClose = () => void 0 } = props;

    // Form for the preset creation
    const {
        control,
        handleSubmit,
        formState: { isValid },
    } = useForm({
        mode: "onChange",
    });

    const onSubmit = async (input) => {
        await addAnalyticsBlockPreset({
            variables: {
                ...input,
            },
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{t("analytics:titleAddPreset")}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} direction="column">
                        <Grid item>
                            <Typography>
                                {t("analytics:bodyAddPreset")}
                            </Typography>
                        </Grid>
                        {/* Preset title */}
                        <Grid item>
                            <TextFieldController
                                control={control}
                                autoFocus
                                fullWidth
                                label={t("analytics:presetName")}
                                name="presetName"
                                required
                            />
                        </Grid>
                        {/* Analytics type select */}
                        <Grid item>
                            <SelectController
                                control={control}
                                style={{ minWidth: 200 }}
                                displayEmpty
                                variant="outlined"
                                label={t("analytics:type")}
                                name="type"
                                defaultValue={AnalyticsType.course}
                            >
                                {Object.keys(AnalyticsType).map((key) => {
                                    return (
                                        <MenuItem
                                            key={key}
                                            value={AnalyticsType[key]}
                                        >
                                            {t(
                                                `analytics:type_${AnalyticsType[key]}`
                                            )}
                                        </MenuItem>
                                    );
                                })}
                            </SelectController>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("cancel")}</Button>
                    <Button
                        type="submit"
                        color="primary"
                        key={`${!isValid}`}
                        disabled={!isValid}
                    >
                        {t("continue")}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
