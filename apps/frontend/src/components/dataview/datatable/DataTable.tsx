import {
    Checkbox,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { useDebounce } from "ui/hooks/Debounce";
import { DataTableColumnHeader } from "./DataTableColumnHeader";
import { DataTableEmptyRow } from "./DataTableEmptyRow";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableQuery } from "./DataTableQuery";
import { DataTableRow } from "./DataTableRow";
import { DataTableToolbar } from "./DataTableToolbar";

export interface IDataTableColumnHeader<T extends IDataTableEntry> {
    headerName?: string;
    field?: string;
    defaultOrderBy?: boolean;
    align?: "inherit" | "left" | "center" | "right" | "justify";
    sorting?: boolean;
    render?: (rowData: T, index: number) => ReactNode;
    renderPlaceHolder?: () => ReactNode;
}

export interface IDataTableEntry {
    id: string;
}

export interface DataTableProps<T extends IDataTableEntry>
    extends DataTableQuery {
    title?: string;
    emptyText?: string;
    columns: IDataTableColumnHeader<T>[];
    rows?: T[];
    total?: number;
    loading?: boolean;
    updateQuery?: (query: Partial<DataTableQuery>) => void;
    pageSizes?: number[];
    selectedRows?: string[];
    onChangeSelectedRows?: (selected: string[]) => void;
    onDeleteRows?: () => void;
    searchDebounce?: number;
    hideSearch?: boolean;
    selectable?: boolean;
    hideEmptyRows?: boolean;
    onRowClick?: (entry: T, index: number) => void;
    toolbarSelectedComponents?: (entries: T[]) => JSX.Element;
    toolbarUnselectedComponents?: (entries: T[]) => JSX.Element;
}

export function DataTable<T extends IDataTableEntry>(props: DataTableProps<T>) {
    const {
        title,
        emptyText,
        columns,
        rows = [],
        total = 0,
        loading = false,
        updateQuery = (_: Partial<DataTableQuery>) => void 0,
        pageSizes = [10, 25, 50],
        selectedRows = [],
        onChangeSelectedRows = (_: string[]) => void 0,
        onDeleteRows = () => void 0,
        toolbarSelectedComponents,
        toolbarUnselectedComponents,
        searchDebounce = 500,
        hideSearch = false,
        selectable = true,
        hideEmptyRows = false,
        onRowClick,
        page,
        pageSize,
        orderBy,
        order,
        term,
    } = props;
    const [searchTerm, setSearchTerm] = useState<string>(term);
    const debouncedSearchTerm = useDebounce(searchTerm, searchDebounce);
    const { t } = useTranslation();

    useEffect(() => {
        // only update if the term actually changed
        if (term === debouncedSearchTerm.trim()) {
            return;
        }
        updateQuery({ term: debouncedSearchTerm, page: 1 });
    }, [debouncedSearchTerm]);

    const handleChangePage = useCallback(
        async (newPage: number) => {
            updateQuery({ page: newPage });
        },
        [page]
    );

    const handleChangeRowsPerPage = async (newPageSize: number) => {
        if (newPageSize === pageSize) {
            return;
        }
        updateQuery({
            pageSize: newPageSize,
            page: 1,
        });
    };

    return (
        <>
            {(!hideSearch || title || selectable) && (
                <DataTableToolbar
                    hideSearch={hideSearch}
                    title={title}
                    selectedRows={selectedRows}
                    searchTerm={searchTerm}
                    onSearchChanged={(newTerm: string) =>
                        setSearchTerm(newTerm)
                    }
                    rows={rows}
                    onClickDelete={onDeleteRows}
                    toolbarSelectedComponents={toolbarSelectedComponents}
                    toolbarUnselectedComponents={toolbarUnselectedComponents}
                />
            )}
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {selectable && (
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        color="primary"
                                        disabled={rows.length === 0}
                                        indeterminate={
                                            rows.length > selectedRows.length &&
                                            selectedRows.length > 0
                                        }
                                        checked={
                                            rows.length > 0 &&
                                            rows.length === selectedRows.length
                                        }
                                        onChange={(evt) => {
                                            if (evt.target.checked) {
                                                onChangeSelectedRows(
                                                    rows.map((e) => e.id)
                                                );
                                            } else {
                                                onChangeSelectedRows([]);
                                            }
                                        }}
                                    />
                                </TableCell>
                            )}
                            {columns.map((column, index) => (
                                <DataTableColumnHeader
                                    key={index}
                                    column={column}
                                    index={index}
                                    updateQuery={updateQuery}
                                    order={order}
                                    orderBy={orderBy}
                                />
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {!loading &&
                            rows.map((entry, index) =>
                                Boolean(entry) ? (
                                    <DataTableRow
                                        key={index}
                                        index={index}
                                        entry={entry}
                                        columns={columns}
                                        onRowClick={onRowClick}
                                        selectable={selectable}
                                        selectedRows={selectedRows}
                                        onChangeSelectedRows={
                                            onChangeSelectedRows
                                        }
                                    />
                                ) : undefined
                            )}
                        {!loading && rows.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={
                                        selectable
                                            ? columns.length + 1
                                            : columns.length
                                    }
                                >
                                    <Align center>
                                        <Typography>
                                            {emptyText || t("noEntriesFound")}
                                        </Typography>
                                    </Align>
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading &&
                            rows.length > 0 &&
                            rows.length < pageSize &&
                            !hideEmptyRows &&
                            [...Array(pageSize - rows.length)].map((e, i) => (
                                <DataTableEmptyRow
                                    key={`emptyRow_${i}`}
                                    transparent
                                    columns={columns}
                                />
                            ))}
                        {loading &&
                            [...Array(pageSize)].map((e, i) => (
                                <DataTableEmptyRow
                                    key={`emptyRow_${i}`}
                                    columns={columns}
                                />
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <DataTablePagination
                rowsPerPageOptions={pageSizes}
                total={total}
                rowsPerPage={pageSize}
                page={page}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
            />
        </>
    );
}
