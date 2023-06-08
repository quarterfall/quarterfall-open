import { Alert, Grid } from "@mui/material";
import { AssignmentLayout } from "features/assignment/staff/layout/AssignmentLayout";
import { AnalyticsBlockEditor } from "features/course/staff/analytics/AnalyticsBlockEditor";
import { useUpdateCourseAnalyticsBlock } from "features/course/staff/analytics/api/Analytics.data";
import { useToast } from "hooks/useToast";
import { AnalyticsBlock } from "interface/AnalyticsBlock.interface";
import { Assignment } from "interface/Assignment.interface";
import { useTranslation } from "react-i18next";
import { PageHeading } from "ui/PageHeading";
import { useQueryParams } from "ui/route/QueryParams";
export interface EditAssignmentAnalyticsBlockProps {
    assignment: Assignment;
    analyticsBlock: AnalyticsBlock;
}

export const EditAssignmentAnalyticsBlockPage = (
    props: EditAssignmentAnalyticsBlockProps
) => {
    const { assignment, analyticsBlock } = props;
    const [params, updateParams] = useQueryParams<{
        showPreview: boolean;
        useTestData: boolean;
    }>({
        showPreview: true,
        useTestData: true,
    });
    const { t } = useTranslation();
    const module = assignment?.module;
    const course = module?.course;
    const blockId = analyticsBlock.id;

    const [updateCourseAnalyticsBlockMutation] =
        useUpdateCourseAnalyticsBlock();
    const { showSuccessToast } = useToast();

    const handleUpdateAnalyticsBlock = async (
        input: Partial<AnalyticsBlock>
    ) => {
        await updateCourseAnalyticsBlockMutation({
            variables: {
                id: blockId,
                input,
            },
        });
        showSuccessToast();
    };

    return (
        <AssignmentLayout assignment={assignment} selected="analytics">
            <Grid container direction="column" spacing={1}>
                <Grid item>
                    <PageHeading
                        title={
                            analyticsBlock?.title
                                ? t(analyticsBlock.title)
                                : t("analytics:block")
                        }
                    />
                </Grid>
                <Grid item>
                    <Alert severity="warning">
                        {t("analytics:warningEditBlockAssignment")}
                    </Alert>
                </Grid>
                <Grid item>
                    <AnalyticsBlockEditor
                        disabled={course.archived}
                        analyticsBlock={analyticsBlock}
                        showPreview
                        useTestData={params.useTestData}
                        courseId={course?.id}
                        targetId={assignment?.id}
                        onChangeUseTestData={(useTestData) =>
                            updateParams({ useTestData })
                        }
                        onChangeAnalyticsBlock={handleUpdateAnalyticsBlock}
                    />
                </Grid>
            </Grid>
        </AssignmentLayout>
    );
};
