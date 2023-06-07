import { Grid } from "@mui/material";
import { useAuthContext } from "context/AuthProvider";
import { AnalyticsBlockEditor } from "features/course/staff/analytics/AnalyticsBlockEditor";
import { useUpdateCourseAnalyticsBlockDefault } from "features/organization/api/OrganizationAnalytics.data";
import { OrganizationLayout } from "features/organization/layout/OrganizationLayout";
import { useToast } from "hooks/useToast";
import { AnalyticsBlock } from "interface/AnalyticsBlock.interface";
import { useTranslation } from "react-i18next";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { PageHeading } from "ui/PageHeading";
import { useParams } from "ui/route/Params";
export function EditOrganizationAnalyticsBlockDefaultPage() {
    const { t } = useTranslation();
    const { blockId } = useParams<{ blockId: string }>();
    const [updateAnalyticsBlockMutation] =
        useUpdateCourseAnalyticsBlockDefault();
    const { showSuccessToast } = useToast();

    const { me } = useAuthContext();

    const handleUpdateAnalyticsBlock = async (
        input: Partial<AnalyticsBlock>
    ) => {
        await updateAnalyticsBlockMutation({
            variables: {
                id: blockId,
                input,
            },
        });
        showSuccessToast();
    };
    const block = (me.organization?.courseAnalyticsBlockDefaults || []).find(
        (b) => b.id === blockId
    );

    if (!block) {
        return <AccessErrorPage />;
    }

    return (
        <OrganizationLayout selected="analytics-defaults">
            <Grid container direction="column" spacing={1}>
                <Grid item>
                    <PageHeading
                        title={
                            block?.title ? t(block.title) : t("analytics:block")
                        }
                    />
                </Grid>
                <Grid item>
                    <AnalyticsBlockEditor
                        analyticsBlock={block}
                        showPreview
                        useTestData
                        onChangeAnalyticsBlock={handleUpdateAnalyticsBlock}
                    />
                </Grid>
            </Grid>
        </OrganizationLayout>
    );
}
