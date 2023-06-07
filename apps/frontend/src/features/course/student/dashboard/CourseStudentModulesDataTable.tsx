import { Paper, Stack, Typography } from "@mui/material";
import { DataTable } from "components/dataview/datatable/DataTable";
import {
    DataTableQuery,
    useDataTableQuery,
} from "components/dataview/datatable/DataTableQuery";
import { SortingOrder } from "core";
import { format, isAfter, isBefore } from "date-fns";
import {
    getModuleEndDate,
    getModuleStartDate,
} from "features/module/student/utils/ModuleStudentUtils";
import { useDataTableOperations } from "hooks/useDataTableOperations";
import { Course } from "interface/Course.interface";
import { Module } from "interface/Module.interface";
import { useTranslation } from "react-i18next";
import { ProminentLinearProgress } from "ui/progress/ProminentLinearProgress";
import { useNavigation } from "ui/route/Navigation";
import { useQueryParams } from "ui/route/QueryParams";
import { ToggleChip } from "ui/ToggleChip";

interface ModuleTableEntry extends Module {}

interface CourseModulesQuery extends DataTableQuery {}

interface CourseStudentModulesDataTableProps {
    course: Course;
    loading?: boolean;
}
type Align = "center" | "inherit" | "right" | "left" | "justify";

export function CourseStudentModulesDataTable(
    props: CourseStudentModulesDataTableProps
) {
    const { course, loading } = props;
    const { t } = useTranslation();
    const router = useNavigation();

    const [query, updateQuery] = useDataTableQuery<CourseModulesQuery>({
        orderBy: "title",
        order: SortingOrder.asc,
    });

    const handleFilterData = (module: Module) =>
        `${module?.title}`.toLowerCase().includes(query?.term?.toLowerCase());

    const [filterData, sortData, paginateData] = useDataTableOperations<Module>(
        query,
        handleFilterData
    );

    const [params, updateParams] = useQueryParams<{
        hide_past: boolean;
        hide_future: boolean;
        hide_completed: boolean;
    }>({
        hide_past: false,
        hide_future: false,
        hide_completed: false,
    });

    const moduleIsPast = (m: Module): boolean =>
        m.endDate && isAfter(new Date(), new Date(m.endDate));
    const moduleIsFuture = (m: Module): boolean =>
        m.startDate && isBefore(new Date(), new Date(m.startDate));
    const modules = (course?.modules || []).filter(
        (m) =>
            (!params.hide_completed || !m.completed) &&
            (!params.hide_past || !moduleIsPast(m)) &&
            (!params.hide_future || !moduleIsFuture(m))
    );

    const handleTogglePast = () =>
        updateParams({
            hide_past: !params.hide_past,
        });

    const handleToggleCompleted = () =>
        updateParams({
            hide_completed: !params.hide_completed,
        });

    const handleToggleFuture = () =>
        updateParams({
            hide_future: !params.hide_future,
        });

    // compute the user data
    const filteredModules = filterData(modules);
    const sortedModules = sortData(filteredModules);
    const paginatedModules = paginateData(sortedModules);

    const entries: ModuleTableEntry[] = paginatedModules;
    const columns = [
        {
            field: "title",
            headerName: t("module:title"),
        },
        {
            field: "startDate",
            headerName: t("module:startDate"),
            render: function render(rowData: Module) {
                const startDate = getModuleStartDate(rowData, course);
                return (
                    <>{startDate ? format(new Date(startDate), "PPp") : null}</>
                );
            },
        },
        {
            field: "endDate",
            headerName: t("module:endDate"),
            render: function render(rowData: Module) {
                const endDate = getModuleEndDate(rowData, course);
                return <>{endDate ? format(new Date(endDate), "PPp") : null}</>;
            },
        },
        {
            field: "progress",
            headerName: t("progress"),
            align: "center" as Align,
            render: function render(rowData: Module) {
                const assignments = rowData.assignments || [];
                const completedAssignmentsCount = assignments.filter(
                    (a) => a.completed
                ).length;
                const moduleCompletedPercentage =
                    (completedAssignmentsCount / assignments.length) * 100 || 0;
                return (
                    <ProminentLinearProgress
                        variant="determinate"
                        value={moduleCompletedPercentage}
                    />
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
                onRowClick={(module) => {
                    router.push(`/student/module/${module?.id}`);
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
                                selected={!params.hide_past}
                                label={t("module:pastModulesChip")}
                                onClick={handleTogglePast}
                            />
                            <ToggleChip
                                size="small"
                                selected={!params.hide_future}
                                label={t("module:futureModulesChip")}
                                onClick={handleToggleFuture}
                            />
                            <ToggleChip
                                size="small"
                                selected={!params.hide_completed}
                                label={t("module:completedModulesChip")}
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
