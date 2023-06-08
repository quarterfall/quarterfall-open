import { Alert, Box, Grid } from "@mui/material";
import {
    DataTableQuery,
    useDataTableQuery,
} from "components/dataview/datatable/DataTableQuery";
import { AssignmentLayout } from "features/assignment/staff/layout/AssignmentLayout";
import { useSearchSubmissions } from "features/submission/table/Submission.data";
import { SubmissionsTable } from "features/submission/table/SubmissionsTable";
import { Assignment } from "interface/Assignment.interface";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { PageHeading } from "ui/PageHeading";

interface AssignmentGradingPageProps {
    assignment: Assignment;
}

interface Query extends DataTableQuery {
    moduleIds: string[];
    assignmentIds: string[];
    userIds: string[];
    hasAssignmentFilter: boolean;
    hasModuleFilter: boolean;
    hasUserFilter: boolean;
}

export const AssignmentGradingPage = (props: AssignmentGradingPageProps) => {
    const { assignment } = props;
    const { t } = useTranslation();

    const module = assignment?.module;
    const course = module?.course;

    const [query, updateQuery] = useDataTableQuery<Query>({
        orderBy: "lastName",
        assignmentIds: [assignment?.id],
        hasAssignmentFilter: true,
        userIds: [],
        hasUserFilter: false,
    });

    const [
        searchSubmissions,
        { data: submissionsData, loading: submissionsLoading },
    ] = useSearchSubmissions();

    useEffect(() => {
        const variables: any = { courseId: course?.id, ...query };
        variables.moduleIds = variables.hasModuleFilter
            ? variables.moduleIds
            : undefined;
        variables.assignmentIds = variables.hasAssignmentFilter
            ? variables.assignmentIds
            : undefined;
        variables.userIds = variables.hasUserFilter
            ? variables.userIds
            : undefined;
        variables.hideApproved = true;
        searchSubmissions({ variables });
    }, [query, searchSubmissions, assignment?.id]);

    return (
        <AssignmentLayout selected="grading" assignment={assignment}>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <PageHeading title={t("grading")} />
                </Grid>
                {course?.archived && (
                    <Grid item xs={12}>
                        <Alert severity="info">
                            {t("course:archivedMessageStaff")}
                        </Alert>
                    </Grid>
                )}
                <Grid item xs={12}>
                    <SubmissionsTable
                        submissions={
                            submissionsData?.searchSubmissions?.items || []
                        }
                        total={submissionsData?.searchSubmissions?.total}
                        loading={submissionsLoading}
                        selectable={!course.archived}
                        emptyText={t("assignment:finishedGradingText")}
                        hasGrading
                        {...query}
                        updateQuery={updateQuery}
                    />
                </Grid>
            </Grid>

            <Box style={{ height: 100 }} />
        </AssignmentLayout>
    );
};
