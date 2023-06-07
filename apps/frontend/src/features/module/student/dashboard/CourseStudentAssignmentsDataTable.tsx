import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Chip, Paper, Rating, Stack, Typography } from "@mui/material";
import { DataTable } from "components/dataview/datatable/DataTable";
import {
    DataTableQuery,
    useDataTableQuery,
} from "components/dataview/datatable/DataTableQuery";
import { SortingOrder } from "core";
import { useDataTableOperations } from "hooks/useDataTableOperations";
import { Assignment } from "interface/Assignment.interface";
import { Module } from "interface/Module.interface";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { useNavigation } from "ui/route/Navigation";
import { useQueryParams } from "ui/route/QueryParams";
import { ToggleChip } from "ui/ToggleChip";

type align = "center" | "inherit" | "right" | "left" | "justify";

interface AssignmentTableEntry extends Assignment {}

interface AssignmentsQuery extends DataTableQuery {
    hide_optional?: boolean;
}

interface CourseStudentAssignmentsDataTableProps {
    module: Module;
    loading?: boolean;
    refetch?: () => void;
}

export function CourseStudentAssignmentsDataTable(
    props: CourseStudentAssignmentsDataTableProps
) {
    const { module, loading } = props;
    const { t } = useTranslation();
    const router = useNavigation();

    const course = module?.course;

    const [query, updateQuery] = useDataTableQuery<AssignmentsQuery>({
        orderBy: "endDate",
        order: SortingOrder.asc,
    });

    const handleFilterData = (assignment: Assignment) =>
        `${assignment?.title}`
            .toLowerCase()
            .includes(query?.term?.toLowerCase());

    const [filterData, sortData, paginateData] =
        useDataTableOperations<Assignment>(query, handleFilterData);

    const [params, updateParams] = useQueryParams<{
        hide_completed: boolean;
        hide_optional: boolean;
    }>({
        hide_completed: false,
        hide_optional: false,
    });

    // filters
    const handleToggleCompleted = () => {
        updateParams({ hide_completed: !params.hide_completed });
    };

    const handleToggleOptional = () => {
        updateParams({ hide_optional: !params.hide_optional });
    };

    const assignments = (module.assignments || []).filter(
        (a) =>
            (!params.hide_completed || !a.completed) &&
            (!params.hide_optional || !a.isOptional)
    );
    const filteredAssignments = filterData(assignments);
    const sortedAssignments = sortData(filteredAssignments);
    const paginatedAssignments = paginateData(sortedAssignments);

    const entries: AssignmentTableEntry[] = paginatedAssignments;
    const columns = [
        {
            field: "title",
            headerName: t("assignment:title"),
            sorting: true,
        },
        {
            field: "difficulty",
            headerName: t("assignment:difficulty"),
            align: "center" as align,
            render: function render(rowData: Partial<Assignment>) {
                return <Rating value={rowData.difficulty} readOnly />;
            },
        },
        {
            field: "completed",
            headerName: t("assignment:completed"),
            align: "center" as align,
            render: function render(rowData: Partial<Assignment>) {
                return rowData?.submission?.submittedDate ? (
                    <CheckCircleIcon color="success" />
                ) : null;
            },
        },
        {
            field: "tags",
            headerName: t("tags"),
            align: "right" as align,
            render: function render(rowData: Partial<Assignment>) {
                return (
                    <Align right>
                        <Stack direction="row" spacing={1}>
                            {rowData?.isOptional ? null : (
                                <Chip
                                    color="primary"
                                    label={t("assignment:isMandatory")}
                                    size="small"
                                />
                            )}
                            {rowData?.hasGrading && (
                                <Chip
                                    color="primary"
                                    label={t("assignment:hasGrading")}
                                    size="small"
                                />
                            )}
                        </Stack>
                    </Align>
                );
            },
        },
    ];

    return (
        <Paper>
            <DataTable
                rows={entries}
                columns={columns}
                selectable={false}
                onRowClick={(assignment) => {
                    router.push(`/student/assignment/${assignment?.id}`);
                }}
                loading={loading}
                hideEmptyRows
                total={entries?.length}
                toolbarUnselectedComponents={(rows: Module[]) => {
                    return (
                        <Stack direction="row" spacing={1}>
                            <Typography>{t("show")}</Typography>
                            <ToggleChip
                                size="small"
                                selected={!params.hide_optional}
                                label={t("assignment:optionalMaterialChip")}
                                onClick={handleToggleOptional}
                            />
                            <ToggleChip
                                size="small"
                                selected={!params.hide_completed}
                                label={t("assignment:completedMaterialChip")}
                                onClick={handleToggleCompleted}
                            />
                        </Stack>
                    );
                }}
                {...query}
                updateQuery={updateQuery}
            />
        </Paper>
    );
}
