import { SortingOrder } from "core";
import { useQueryParams } from "ui/route/QueryParams";

export interface DataTableQuery {
    page: number;
    pageSize: number;
    orderBy: string;
    order: SortingOrder;
    term: string;
}

export function useDataTableQuery<T extends DataTableQuery>(
    defaults?: Partial<T>
) {
    return useQueryParams<T>(
        Object.assign(
            {
                page: 1,
                pageSize: 10,
                orderBy: "",
                order: SortingOrder.asc,
                term: "",
            },
            defaults || {}
        ) as T
    );
}
