import { Skeleton, TableCell } from "@mui/material";
import { IDataTableColumnHeader, IDataTableEntry } from "./DataTable";

interface DataTablePlaceholderProps<T extends IDataTableEntry> {
    column: IDataTableColumnHeader<T>;
    index: number;
    transparent?: boolean;
}

export const DataTablePlaceholder = <T extends IDataTableEntry>(
    props: DataTablePlaceholderProps<T>
) => {
    const { column, index, transparent = false } = props;
    return (
        <TableCell
            key={`placeholder_${index}`}
            style={transparent ? { border: 0 } : undefined}
        >
            {column.renderPlaceHolder ? (
                column.renderPlaceHolder()
            ) : (
                <Skeleton
                    sx={{
                        width: "100%",
                        borderRadius: (theme) =>
                            `${theme.shape.borderRadius}px `,
                    }}
                />
            )}
        </TableCell>
    );
};
