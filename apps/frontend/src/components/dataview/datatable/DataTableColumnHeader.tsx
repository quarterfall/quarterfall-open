import { TableCell, TableSortLabel } from "@mui/material";
import { SortingOrder } from "core";
import { IDataTableColumnHeader, IDataTableEntry } from "./DataTable";
import { DataTableQuery } from "./DataTableQuery";

interface DataTableColumnHeaderProps<T extends IDataTableEntry>
    extends Partial<DataTableQuery> {
    column: IDataTableColumnHeader<T>;
    index: number;
    updateQuery?: (query: Partial<DataTableQuery>) => void;
}

export const DataTableColumnHeader = <T extends IDataTableEntry>(
    props: DataTableColumnHeaderProps<T>
) => {
    const { column, index, order, orderBy, updateQuery } = props;
    return (
        <TableCell key={`column_header_${index}`} align={column.align}>
            {column.sorting && (
                <TableSortLabel
                    active={orderBy === column.field}
                    direction={
                        orderBy === column.field ? order : SortingOrder.asc
                    }
                    onClick={() =>
                        updateQuery({
                            orderBy: column.field,
                            order:
                                orderBy === column.field &&
                                order === SortingOrder.asc
                                    ? SortingOrder.desc
                                    : SortingOrder.asc,
                            page: 1,
                        })
                    }
                >
                    {column.headerName || ""}
                </TableSortLabel>
            )}
            {!column.sorting && (column.headerName || "")}
        </TableCell>
    );
};
