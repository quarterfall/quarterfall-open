import { Box, Stack } from "@mui/material";
import {
    DataTableQuery,
    useDataTableQuery,
} from "components/dataview/datatable/DataTableQuery";
import { SortingOrder } from "core";
import { CourseStaffLayout } from "features/course/staff/layout/CourseStaffLayout";
import { CourseStudentsTabs } from "features/course/staff/students/CourseStudentsTabs";
import { useSearchSubmissions } from "features/submission/table/Submission.data";
import { SubmissionsTable } from "features/submission/table/SubmissionsTable";
import { Course } from "interface/Course.interface";
import { useEffect } from "react";
import { PageNotFound } from "routes/error/PageNotFound";
import { useParams } from "ui/route/Params";

type Props = {
    course: Course;
};

interface Query extends DataTableQuery {
    moduleIds: string[];
    assignmentIds: string[];
    userIds: string[];
    hasAssignmentFilter: boolean;
    hasModuleFilter: boolean;
    hasUserFilter: boolean;
}

const StudentSubmissionsPage = (props: Props) => {
    const { course } = props;
    const { studentId } = useParams<{
        studentId: string;
    }>();

    const student = (course?.students || []).find((s) => s.id === studentId);

    const [query, updateQuery] = useDataTableQuery<Query>({
        orderBy: "submittedDate",
        order: SortingOrder.desc,
        assignmentIds: [],
        hasAssignmentFilter: false,
        userIds: [studentId],
        hasUserFilter: true,
    });

    const [
        searchSubmissions,
        { data: submissionsData, loading: submissionsLoading },
    ] = useSearchSubmissions();

    useEffect(() => {
        // remove ids if no filter is active
        const variables: any = {
            courseId: course?.id,
            ...query,
        };
        variables.moduleIds = variables.hasModuleFilter
            ? variables.moduleIds
            : undefined;
        variables.assignmentIds = variables.hasAssignmentFilter
            ? variables.assignmentIds
            : undefined;
        variables.userIds = variables.hasUserFilter
            ? variables.userIds
            : undefined;
        searchSubmissions({ variables });
    }, [query, searchSubmissions, studentId]);

    useEffect(() => {
        updateQuery({
            orderBy: "submittedDate",
            order: SortingOrder.desc,
            assignmentIds: [],
            hasAssignmentFilter: false,
            userIds: [studentId],
            hasUserFilter: true,
        });
    }, [studentId]);

    // find the student

    if (!student) {
        return <PageNotFound />;
    }

    return (
        <CourseStaffLayout selected="students">
            <Stack spacing={2}>
                <CourseStudentsTabs course={course} student={student} />
                <SubmissionsTable
                    submissions={
                        submissionsData?.searchSubmissions?.items || []
                    }
                    total={submissionsData?.searchSubmissions?.total}
                    loading={submissionsLoading}
                    selectable={!course.archived}
                    showAssignmentName
                    showModuleName
                    hideUserInfo
                    {...query}
                    updateQuery={updateQuery}
                />
            </Stack>
            <Box style={{ height: 100 }} />
        </CourseStaffLayout>
    );
};

export default StudentSubmissionsPage;
