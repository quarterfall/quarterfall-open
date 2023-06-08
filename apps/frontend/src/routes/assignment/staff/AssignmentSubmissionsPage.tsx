import {
    Alert,
    Box,
    FormControlLabel,
    Grid,
    Radio,
    RadioGroup,
} from "@mui/material";
import {
    DataTableQuery,
    useDataTableQuery,
} from "components/dataview/datatable/DataTableQuery";
import { AssignmentLayout } from "features/assignment/staff/layout/AssignmentLayout";
import { useSearchSubmissions } from "features/submission/table/Submission.data";
import { SubmissionsTable } from "features/submission/table/SubmissionsTable";
import { Assignment } from "interface/Assignment.interface";
import { Submission } from "interface/Submission.interface";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeading } from "ui/PageHeading";

interface AssignmentSubmissionsPageProps {
    assignment: Assignment;
}

interface Query extends DataTableQuery {
    moduleIds: string[];
    assignmentIds: string[];
    userIds: string[];
    hasAssignmentFilter: boolean;
    hasModuleFilter: boolean;
    hasUserFilter: boolean;
    hideApproved?: boolean;
    hideUnapproved?: boolean;
}

export const AssignmentSubmissionsPage = (
    props: AssignmentSubmissionsPageProps
) => {
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
        hideApproved: false,
        hideUnapproved: false,
    });

    const [value, setValue] = useState("showAll");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue((event.target as HTMLInputElement).value);
        switch ((event.target as HTMLInputElement).value) {
            case "showAll":
                return handleToggleShowAll();
            case "showApproved":
                return handleToggleHideUnapproved();
            case "showUnapproved":
                return handleToggleHideApproved();
        }
    };

    const handleToggleShowAll = () => {
        updateQuery({
            hideApproved: false,
            hideUnapproved: false,
        });
    };

    const handleToggleHideApproved = () => {
        updateQuery({
            hideApproved: true,
            hideUnapproved: false,
        });
    };
    const handleToggleHideUnapproved = () => {
        updateQuery({
            hideUnapproved: true,
            hideApproved: false,
        });
    };

    const [
        searchSubmissions,
        { data: submissionsData, loading: submissionsLoading },
    ] = useSearchSubmissions();

    useEffect(() => {
        // remove ids if no filter is active
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
        searchSubmissions({ variables });
    }, [query, searchSubmissions, assignment?.id]);

    return (
        <AssignmentLayout selected="submissions" assignment={assignment}>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <PageHeading title={t("submissions")} />
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
                        toolbarUnselectedComponents={(rows: Submission[]) => {
                            return (
                                assignment.hasGrading && (
                                    <RadioGroup
                                        row
                                        aria-labelledby="submissions-filter-radio"
                                        name="submissions-filter-radio"
                                        value={value}
                                        onChange={handleChange}
                                    >
                                        <FormControlLabel
                                            value="showAll"
                                            control={<Radio size="small" />}
                                            label={t("submission:showAll")}
                                        />
                                        <FormControlLabel
                                            value="showApproved"
                                            control={<Radio size="small" />}
                                            label={t(
                                                "submission:onlyShowApproved"
                                            )}
                                        />
                                        <FormControlLabel
                                            value="showUnapproved"
                                            control={<Radio size="small" />}
                                            label={t(
                                                "submission:onlyShowUnapproved"
                                            )}
                                        />
                                    </RadioGroup>
                                )
                            );
                        }}
                        {...query}
                        updateQuery={updateQuery}
                    />
                </Grid>
            </Grid>

            <Box style={{ height: 100 }} />
        </AssignmentLayout>
    );
};
