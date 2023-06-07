import { Alert, Button, Grid } from "@mui/material";
import { isJSON, ProgrammingLanguage } from "core";
import { GradingScheme } from "interface/GradingScheme.interface";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { useAutosaveForm } from "ui/form/Autosave";
import { CodeEditorController } from "ui/form/CodeEditorController";
import { useTestGradingScheme } from "../api/OrganizationGrading.data";

export interface TestGradingFormProps {
    gradingScheme: Partial<GradingScheme>;
}

export function TestGradingForm(props: TestGradingFormProps) {
    const { gradingScheme } = props;
    const { t } = useTranslation();
    const [testGradingSchemeMutation] = useTestGradingScheme();
    const [testResult, setTestResult] = useState("");

    const testDataJSON = {
        score: 80,
        questions: [
            {
                score: 70,
                weight: 1,
            },
            {
                score: 90,
                weight: 1,
            },
        ],
    };

    const defaultValues = {
        testData: JSON.stringify(testDataJSON, null, 2),
        gradingSchemeCode: gradingScheme?.code,
    };

    const onSave = async (input) => {
        const result = await testGradingSchemeMutation({
            variables: {
                testData: input.testData,
                gradingSchemeCode: gradingScheme?.code,
            },
        });
        setTestResult(result?.data?.testGradingScheme?.result);
    };

    const { control, reset, watch } = useAutosaveForm<{
        testData: string;
        gradingSchemeCode: string;
    }>({
        defaultValues,
        onSave,
    });

    useEffect(() => {
        onSave(defaultValues);
    }, [gradingScheme]);

    return (
        <Grid container spacing={1} direction="column">
            <Grid item xs={12}>
                <CodeEditorController
                    control={control}
                    name="testData"
                    label={t("testData")}
                    language={ProgrammingLanguage.json}
                    controllerProps={{
                        rules: {
                            validate: (v) =>
                                isJSON(v) || (t("validationJSON") as string),
                        },
                    }}
                />
            </Grid>
            <Grid item xs={12}>
                <Align right>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            reset(defaultValues);
                            onSave(defaultValues);
                        }}
                        disabled={watch("testData") === defaultValues?.testData}
                    >
                        {t("reset")}
                    </Button>
                </Align>
            </Grid>
            {testResult && (
                <Grid item xs={12}>
                    <Alert color="success">{testResult}</Alert>
                </Grid>
            )}
        </Grid>
    );
}
