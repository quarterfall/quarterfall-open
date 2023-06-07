import { Alert, Box, Card, CardContent, Stack } from "@mui/material";
import { useUpdateModule } from "features/course/staff/content/api/Module.data";
import { useToast } from "hooks/useToast";
import { Module } from "interface/Module.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";
import { DateTimeController } from "ui/form/DateTimeController";
import { SwitchController } from "ui/form/SwitchController";
import { TextFieldController } from "ui/form/TextFieldController";
export interface EditModuleSettingsCardProps {
    module: Module;
}

export function EditModuleSettingsCard(props: EditModuleSettingsCardProps) {
    const { t } = useTranslation();
    const { module } = props;
    const { showSuccessToast } = useToast();
    const [updateModuleMutation] = useUpdateModule();
    const [showDateAlert, setShowDateAlert] = useState(false);

    const course = module.course;

    const { control, watch } = useAutosaveForm<Module>({
        defaultValues: {
            ...module,
            startDate: module.startDate
                ? new Date(module.startDate)
                : undefined,
            endDate: module.endDate ? new Date(module.endDate) : undefined,
        },
        onSave: async (input: Partial<Module>, allData: Module) => {
            const datesInvalid =
                allData.startDate &&
                allData.endDate &&
                allData.startDate >= allData.endDate;
            setShowDateAlert(datesInvalid);
            if (datesInvalid) {
                return;
            }
            await updateModuleMutation({
                variables: {
                    id: module.id,
                    input,
                },
            });
            showSuccessToast();
        },
    });

    return (
        <form>
            <Card
                sx={{
                    width: "100%",
                }}
            >
                <CardContent>
                    <Stack spacing={2}>
                        {/* Module title input */}
                        <TextFieldController
                            fullWidth
                            label={t("module:title")}
                            name="title"
                            control={control}
                            required
                            disabled={course.archived}
                        />
                        {/* Module description input */}
                        <TextFieldController
                            fullWidth
                            multiline
                            label={t("module:description")}
                            name="description"
                            control={control}
                            disabled={course.archived}
                        />

                        {/* Module visibility */}

                        <SwitchController
                            label={t("visible")}
                            name="visible"
                            control={control}
                            disabled={course.archived}
                        />

                        {/* Module start date */}
                        {!course.library && (
                            <Box
                                sx={{
                                    minWidth: 300,
                                }}
                            >
                                <DateTimeController
                                    label={t("startDateTime")}
                                    name="startDate"
                                    control={control}
                                    disabled={course.archived}
                                    maxDateTime={watch("endDate")}
                                />
                            </Box>
                        )}
                        {!course.library && (
                            <Box
                                sx={{
                                    minWidth: 300,
                                }}
                            >
                                <DateTimeController
                                    label={t("endDateTime")}
                                    name="endDate"
                                    control={control}
                                    disabled={course.archived}
                                    minDateTime={watch("startDate")}
                                />
                            </Box>
                        )}
                        {showDateAlert && (
                            <Alert severity="error">
                                {t("startDateShouldBeBeforeEndDate")}
                            </Alert>
                        )}
                    </Stack>
                </CardContent>
            </Card>
        </form>
    );
}
