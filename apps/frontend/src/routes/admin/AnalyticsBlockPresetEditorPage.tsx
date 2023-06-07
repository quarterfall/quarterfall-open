import { Card, CardContent, CardHeader, Grid, Typography } from "@mui/material";
import {
    useAnalyticsBlockPreset,
    useComputeAnalyticsBlock,
} from "features/admin/analytics/AnalyticsPresets.data";
import { EditAnalyticsPresetCard } from "features/admin/analytics/EditAnalyticsPresetCard";
import { AdminLayout } from "features/admin/layout/AdminLayout";
import { CourseAnalyticsBlockCard } from "features/course/staff/analytics/CourseAnalyticsBlockCard";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DividerText } from "ui/DividerText";
import { Loading } from "ui/Loading";
import { useParams } from "ui/route/Params";

export const AnalyticsBlockPresetEditorPage = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const [log, setLog] = useState<string[]>([]);
    const [analyticsData, setAnalyticsData] = useState("");
    const [computeAnalyticsBlockMutation] = useComputeAnalyticsBlock();
    const { data, loading } = useAnalyticsBlockPreset(id);
    const showPreview = true;
    const [computing, setComputing] = useState(false);

    const handleComputeAnalytics = async () => {
        setComputing(true);
        const result = await computeAnalyticsBlockMutation({
            variables: {
                id,
            },
        });
        const r = result.data?.computeAnalyticsBlock;
        // store the log and the data
        setLog(r?.log || []);
        setAnalyticsData(r?.result || "");
        setComputing(false);
    };

    // compute block analytics when the component is mounted
    useEffect(() => {
        handleComputeAnalytics();
    }, []);

    if (!data || loading) {
        return <Loading />;
    }

    const analyticsBlock = data?.analyticsBlockPreset;

    return (
        <AdminLayout selected="analytics-presets">
            <Grid container spacing={2}>
                <Grid item xs={12} lg={6}>
                    {/* Analytics editor */}
                    <EditAnalyticsPresetCard
                        analyticsBlock={analyticsBlock}
                        onComputeAnalytics={handleComputeAnalytics}
                    />
                </Grid>

                {showPreview && (
                    <Grid item xs={12} lg={6}>
                        <Grid container direction="column" spacing={1}>
                            <Grid item xs={12}>
                                <DividerText text={t("preview")} />
                            </Grid>
                            <Grid item sx={{ maxWidth: "100%" }}>
                                {/* Analytics preview */}
                                <CourseAnalyticsBlockCard
                                    block={analyticsBlock}
                                    result={analyticsData}
                                    preview
                                    computing={computing}
                                />
                            </Grid>
                            {log.length > 0 && (
                                <Grid
                                    item
                                    sx={{
                                        maxWidth: "100%",
                                        width: "100%",
                                    }}
                                >
                                    <Card elevation={0}>
                                        <CardHeader
                                            title={t("analytics:log")}
                                        />
                                        <CardContent>
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
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                )}
            </Grid>
        </AdminLayout>
    );
};
