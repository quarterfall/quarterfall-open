import { Alert, Stack } from "@mui/material";
import { AnalyticsType } from "core";
import { AssignmentLayout } from "features/assignment/staff/layout/AssignmentLayout";
import { AssignmentInfoBlock } from "features/course/staff/analytics/AssignmentInfoBlock";
import { CourseAnalyticsListEditor } from "features/course/staff/analytics/CourseAnalyticsListEditor";
import { Assignment } from "interface/Assignment.interface";
import { Course } from "interface/Course.interface";
import { useTranslation } from "react-i18next";
import { PageHeading } from "ui/PageHeading";
import { useNavigation } from "ui/route/Navigation";

export interface AssignmentAnalyticsPageProps {
    course: Course;
    assignment: Assignment;
}

export const AssignmentAnalyticsPage = (
    props: AssignmentAnalyticsPageProps
) => {
    const { assignment, course } = props;
    const { t } = useTranslation();
    const router = useNavigation();

    const handleEditBlock = (blockId: string) => {
        router.push(`/assignment/${assignment.id}/analytics/${blockId}`);
    };
    return (
        <AssignmentLayout selected="analytics" assignment={assignment}>
            <Stack spacing={1}>
                <PageHeading title={t("analytics")} />
                {course.archived && (
                    <Alert severity="info">
                        {t("course:archivedMessageStaff")}
                    </Alert>
                )}
                <AssignmentInfoBlock assignment={assignment} />
                <CourseAnalyticsListEditor
                    course={course}
                    type={AnalyticsType.assignment}
                    targetId={assignment.id}
                    handleEditBlock={handleEditBlock}
                />
            </Stack>
        </AssignmentLayout>
    );
};
