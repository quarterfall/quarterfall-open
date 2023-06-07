import { Checkbox, TableCell, TableRow } from "@mui/material";
import { memo } from "react";
import { IDataTableColumnHeader, IDataTableEntry } from "./DataTable";

interface Props<T extends IDataTableEntry> {
    index: number;
    entry: T;
    columns: IDataTableColumnHeader<T>[];
    onRowClick?: (entry: T, index: number) => void;
    selectable?: boolean;
    selectedRows?: string[];
    onChangeSelectedRows?: (selected: string[]) => void;
}

export const DataTableRow = memo(
    <T extends IDataTableEntry>(props: Props<T>) => {
        const {
            index,
            entry,
            columns,
            onRowClick,
            selectable,
            selectedRows,
            onChangeSelectedRows,
        } = props;
        return (
            <TableRow
                key={`entry_${index}`}
                hover={Boolean(onRowClick)}
                sx={{
                    ...(Boolean(onRowClick) && {
                        cursor: "pointer",
                    }),
                }}
                role="checkbox"
                selected={selectedRows.indexOf(entry.id) >= 0}
            >
                {selectable && (
                    <TableCell padding="checkbox">
                        <Checkbox
                            color="primary"
                            checked={selectedRows.indexOf(entry.id) >= 0}
                            onChange={(evt) => {
                                if (evt.target.checked) {
                                    onChangeSelectedRows(
                                        selectedRows.concat(entry.id)
                                    );
                                } else {
                                    onChangeSelectedRows(
                                        selectedRows.filter(
                                            (value) => value !== entry.id
                                        )
                                    );
                                }
                            }}
                        />
                    </TableCell>
                )}
                {columns.map((column, idx) => (
                    <TableCell
                        key={`entry_${entry.id}_${idx}`}
                        align={column.align}
                        onClick={() => {
                            if (onRowClick) {
                                onRowClick(entry, index);
                            }
                        }}
                    >
                        {(column.render
                            ? column.render(entry, idx)
                            : column.field && entry[column.field]) || ""}
                    </TableCell>
                ))}
            </TableRow>
        );
    }
);
