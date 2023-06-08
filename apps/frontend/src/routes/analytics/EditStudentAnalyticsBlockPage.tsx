import { Alert, Grid } from "@mui/material";
import { AnalyticsBlockEditor } from "features/course/staff/analytics/AnalyticsBlockEditor";
import { useUpdateCourseAnalyticsBlock } from "features/course/staff/analytics/api/Analytics.data";
import { CourseStaffLayout } from "features/course/staff/layout/CourseStaffLayout";
import { useToast } from "hooks/useToast";
import { AnalyticsBlock } from "interface/AnalyticsBlock.interface";
import { Course } from "interface/Course.interface";
import { User } from "interface/User.interface";
import { useTranslation } from "react-i18next";
import { PageHeading } from "ui/PageHeading";
import { useQueryParams } from "ui/route/QueryParams";
export interface EditStudentAnalyticsBlockPageProps {
    course: Course;
    student: User;
    analyticsBlock: AnalyticsBlock;
}
export const EditStudentAnalyticsBlockPage = (
    props: EditStudentAnalyticsBlockPageProps
) => {
    const { course, analyticsBlock, student } = props;
    const { t } = useTranslation();

    const [params, updateParams] = useQueryParams<{
        showPreview: boolean;
        useTestData: boolean;
    }>({
        showPreview: true,
        useTestData: true,
    });

    const [updateCourseAnalyticsBlockMutation] =
        useUpdateCourseAnalyticsBlock();
    const { showSuccessToast } = useToast();

    const handleUpdateAnalyticsBlock = async (
        input: Partial<AnalyticsBlock>
    ) => {
        await updateCourseAnalyticsBlockMutation({
            variables: {
                id: analyticsBlock.id,
                input,
            },
        });
        showSuccessToast();
    };
    return (
        <CourseStaffLayout selected="students">
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
                        {t("analytics:warningEditBlockStudent")}
                    </Alert>
                </Grid>
                <Grid item>
                    <AnalyticsBlockEditor
                        disabled={course.archived}
                        analyticsBlock={analyticsBlock}
                        showPreview
                        useTestData={params.useTestData}
                        courseId={course?.id}
                        targetId={student?.id}
                        onChangeUseTestData={(useTestData) =>
                            updateParams({ useTestData })
                        }
                        onChangeAnalyticsBlock={handleUpdateAnalyticsBlock}
                    />
                </Grid>
            </Grid>
        </CourseStaffLayout>
    );
};
