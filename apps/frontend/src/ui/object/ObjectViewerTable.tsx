import { Typography } from "@mui/material";
import {
    DataTable,
    DataTableProps,
} from "components/dataview/datatable/DataTable";
import { useDataTableQuery } from "components/dataview/datatable/DataTableQuery";
import { useDataTableOperations } from "hooks/useDataTableOperations";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "react-error-boundary";
import { BaseObjectViewerProps } from "./ObjectViewer";
const Markdown = dynamic(() => import("ui/markdown/Markdown"));

export type ObjectViewerTableProps = BaseObjectViewerProps &
    DataTableProps<any>;

export function ObjectViewerTable(props: ObjectViewerTableProps) {
    const { files, columns = [], rows = [], ...rest } = props;
    const [query, updateQuery] = useDataTableQuery();

    const [_filterData, sortData, paginateData] = useDataTableOperations(query);
    const sortedRows = sortData(rows);
    const paginatedRows = paginateData(sortedRows);

    // add markdown rendering to each column
    return (
        <ErrorBoundary
            fallbackRender={({ error }) => (
                <Typography color="error">{error.toString()}</Typography>
            )}
        >
            <DataTable
                columns={columns.map((column) => ({
                    render: (params) => (
                        <Markdown files={files}>
                            {String(params[column.field.toString()] || "")}
                        </Markdown>
                    ),
                    ...column,
                }))}
                selectable={false}
                rows={paginatedRows as any[]}
                total={sortedRows.length}
                hideEmptyRows
                {...query}
                updateQuery={updateQuery}
                hideSearch
                {...rest}
            />
        </ErrorBoundary>
    );
}
