import { Skeleton, TableCell, TableRow } from "@mui/material";
import { IDataTableColumnHeader, IDataTableEntry } from "./DataTable";
import { DataTablePlaceholder } from "./DataTablePlaceholder";

interface DataTableEmptyRowProps<T extends IDataTableEntry> {
    key: string;
    transparent?: boolean;
    selectable?: boolean;
    columns: IDataTableColumnHeader<T>[];
}

export const DataTableEmptyRow = <T extends IDataTableEntry>(
    props: DataTableEmptyRowProps<T>
) => {
    const { key, transparent, selectable, columns } = props;
    return (
        <TableRow key={key} style={transparent ? { opacity: 0 } : undefined}>
            {selectable && (
                <TableCell style={transparent ? { border: 0 } : undefined}>
                    <Skeleton
                        style={{
                            width: 20,
                            height: 20,
                        }}
                        variant="rectangular"
                    />
                </TableCell>
            )}
            {columns.map((column, index) => (
                <DataTablePlaceholder
                    key={index}
                    column={column}
                    index={index}
                />
            ))}
        </TableRow>
    );
};
