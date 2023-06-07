import { SortingOrder } from "core";
import { DataTableQuery } from "../components/dataview/datatable/DataTableQuery";

export type DataTableCleaning<T> = [
    filterData: (p: Partial<T[]>) => T[],
    sortData: (p: Partial<T[]>) => T[],
    paginateData: (p: Partial<T[]>) => T[]
];

export function useDataTableOperations<T>(
    query: DataTableQuery,
    handleFilterData?: (_: T) => void
): DataTableCleaning<T> {
    const { page, pageSize, term, order, orderBy } = query;

    const filterData = (data: T[]) => {
        return data?.filter((item) => {
            if (!term) {
                return true;
            } else {
                if (!handleFilterData) {
                    return false;
                }
                return handleFilterData(item);
            }
        });
    };

    const sortData = (data: T[]) => {
        return stableSort(data, getComparator(order, orderBy));
    };

    const paginateData = (data: T[]) => {
        const sliceStart = (pageSize || 0) * (page - 1);
        const sliceEnd = sliceStart + pageSize;
        return data?.slice(sliceStart, sliceEnd);
    };
    return [filterData, sortData, paginateData];
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator<Key extends keyof any>(
    order: SortingOrder,
    orderBy: Key
): (a, b) => number {
    return order === SortingOrder.desc
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array?.map(
        (el, index) => [el, index] as [T, number]
    );
    stabilizedThis?.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis?.map((el) => el[0]);
}
