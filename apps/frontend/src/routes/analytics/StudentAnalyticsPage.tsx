import { Stack } from "@mui/material";
import { AnalyticsType } from "core";
import { CourseAnalyticsListEditor } from "features/course/staff/analytics/CourseAnalyticsListEditor";
import { CourseStaffLayout } from "features/course/staff/layout/CourseStaffLayout";
import { CourseStudentInfoCard } from "features/course/staff/students/CourseStudentInfoCard";
import { CourseStudentsTabs } from "features/course/staff/students/CourseStudentsTabs";
import { Course } from "interface/Course.interface";
import { PageNotFound } from "routes/error/PageNotFound";
import { useNavigation } from "ui/route/Navigation";
import { useParams } from "ui/route/Params";

export interface StudentAnalyticsPageProps {
    course: Course;
}

export const StudentAnalyticsPage = (props: StudentAnalyticsPageProps) => {
    const { course } = props;
    const { id, studentId } = useParams<{
        id: string;
        studentId: string;
    }>();

    // find the student
    const student = (course?.students || []).find((u) => u.id === studentId);

    const router = useNavigation();
    const handleEditBlock = (blockId: string) => {
        router.push(
            `/course/${course.id}/students/${student.id}/analytics/${blockId}`
        );
    };
    if (!student) {
        return <PageNotFound />;
    }
    return (
        <CourseStaffLayout selected="students">
            <Stack spacing={2}>
                <CourseStudentsTabs course={course} student={student} />
                <CourseStudentInfoCard student={student} />
                <CourseAnalyticsListEditor
                    course={course}
                    type={AnalyticsType.student}
                    targetId={student?.id}
                    handleEditBlock={handleEditBlock}
                />
            </Stack>
        </CourseStaffLayout>
    );
};
