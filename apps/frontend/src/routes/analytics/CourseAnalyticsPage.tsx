import { Stack } from "@mui/material";
import { AnalyticsHeader } from "components/analytics/AnalyticsHeader";
import { AnalyticsType } from "core";
import { CourseAnalyticsListEditor } from "features/course/staff/analytics/CourseAnalyticsListEditor";
import { CourseStaffLayout } from "features/course/staff/layout/CourseStaffLayout";
import { Course } from "interface/Course.interface";
import { useNavigation } from "ui/route/Navigation";

export interface CourseAnalyticsPageProps {
    course: Course;
}

export const CourseAnalyticsPage = (props: CourseAnalyticsPageProps) => {
    const { course } = props;
    const router = useNavigation();
    const handleEditBlock = (blockId: string) => {
        router.push(`/course/${course.id}/analytics/${blockId}`);
    };
    return (
        <CourseStaffLayout selected="analytics">
            <Stack spacing={1} alignItems="stretch">
                <AnalyticsHeader course={course} />
                <CourseAnalyticsListEditor
                    course={course}
                    type={AnalyticsType.course}
                    handleEditBlock={handleEditBlock}
                />
            </Stack>
        </CourseStaffLayout>
    );
};
