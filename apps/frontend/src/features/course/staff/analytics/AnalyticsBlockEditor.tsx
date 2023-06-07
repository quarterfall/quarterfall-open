import {
    Alert,
    Card,
    CardContent,
    CardHeader,
    Grid,
    Skeleton,
    Typography,
} from "@mui/material";
import { AnalyticsBlock } from "interface/AnalyticsBlock.interface";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { LabeledSwitch } from "ui/form/inputs/LabeledSwitch";
import { PreviewContainer } from "ui/PreviewContainer";
import { useComputeAnalyticsBlock } from "./api/Analytics.data";
import { CourseAnalyticsBlockCard } from "./CourseAnalyticsBlockCard";
import { EditAnalyticsBlockCard } from "./EditAnalyticsBlockCard";

export interface AnalyticsBlockEditorProps {
    disabled?: boolean;
    analyticsBlock: AnalyticsBlock;
    showPreview?: boolean;
    useTestData?: boolean;
    onChangeUseTestData?: (value: boolean) => void;
    onChangeAnalyticsBlock: (data: Partial<AnalyticsBlock>) => void;
    courseId?: string;
    targetId?: string;
}

export function AnalyticsBlockEditor(props: AnalyticsBlockEditorProps) {
    const {
        disabled,
        analyticsBlock,
        useTestData = true,
        onChangeUseTestData,
        onChangeAnalyticsBlock,
        courseId = "",
        targetId,
    } = props;
    const { t } = useTranslation();
    const [log, setLog] = useState<string[]>([]);
    const [analyticsData, setAnalyticsData] = useState("");
    const [computeAnalyticsBlockMutation] = useComputeAnalyticsBlock();

    const [computing, setComputing] = useState(false);
    const [isComputed, setIsComputed] = useState(false);

    const handleComputeAnalytics = async () => {
        if (computing) {
            return;
        }
        setComputing(true);
        const result = await computeAnalyticsBlockMutation({
            variables: {
                id: analyticsBlock.id,
                courseId: useTestData ? undefined : courseId,
                targetId,
            },
        });
        const r = result.data?.computeAnalyticsBlock;
        // store the log and the data
        setLog(r?.log || []);
        setAnalyticsData(r?.result || "");
        setComputing(false);
        setIsComputed(true);
    };

    useEffect(() => {
        handleComputeAnalytics();
    }, []);

    useEffect(() => {
        handleComputeAnalytics();
    }, [useTestData]);

    useEffect(() => {
        setIsComputed(false);
    }, [analyticsBlock]);

    return (
        <PreviewContainer
            preview={
                <Grid container direction="column" spacing={1}>
                    {!computing && !isComputed && (
                        <Grid item style={{ maxWidth: "100%" }}>
                            <Alert severity="info">
                                {t("analytics:recomputeAlert")}
                            </Alert>
                        </Grid>
                    )}
                    <Grid item style={{ maxWidth: "100%" }}>
                        {/* Analytics preview */}
                        <CourseAnalyticsBlockCard
                            block={analyticsBlock}
                            result={analyticsData}
                            preview
                            computing={computing}
                            handleCompute={handleComputeAnalytics}
                        />
                    </Grid>

                    {log.length > 0 && (
                        <Grid
                            item
                            style={{
                                maxWidth: "100%",
                                width: "100%",
                            }}
                        >
                            <Card
                                sx={{
                                    background: "background.default",
                                }}
                            >
                                <CardHeader title={t("analytics:log")} />
                                <CardContent>
                                    {computing ? (
                                        <Skeleton
                                            variant="text"
                                            sx={{
                                                width: "100%",
                                                borderRadius: (theme) =>
                                                    `${theme.shape.borderRadius}px `,
                                            }}
                                        />
                                    ) : (
                                        <Typography
                                            sx={{
                                                whiteSpace: "pre-line",
                                                fontFamily:
                                                    '"Fira Mono", monospace',
                                                fontSize: 12,
                                                wordWrap: "break-word",
                                            }}
                                            color="textSecondary"
                                        >
                                            {log.join("\n")}
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            }
        >
            {/* Analytics editor */}

            <EditAnalyticsBlockCard
                disabled={disabled}
                analyticsBlock={analyticsBlock}
                onChange={onChangeAnalyticsBlock}
            />
            {onChangeUseTestData && (
                <Align right>
                    <LabeledSwitch
                        label={t("analytics:useTestDataset")}
                        labelPlacement="start"
                        checked={useTestData}
                        onChange={(evt, checked) =>
                            onChangeUseTestData(checked)
                        }
                    />
                </Align>
            )}
        </PreviewContainer>
    );
}
