import {
    Box,
    Grid,
    MenuItem,
    Select,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";
import { SortingOrder } from "core";
import { ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "ui/hooks/Debounce";
import { SearchField } from "ui/SearchField";
import { DataTableQuery } from "../datatable/DataTableQuery";
import { DataGridViewPagination } from "./DataGridViewPagination";

export interface DataGridViewEntry {
    id: string;
}

export interface DataGridViewField {
    title: string;
    field: string;
}

export interface DataGridViewProps<T extends DataGridViewEntry>
    extends DataTableQuery {
    emptyText?: string;
    entries?: T[];
    fields?: DataGridViewField[];
    filterActions?: ReactNode;
    renderPlaceholder?: () => ReactNode;
    renderEntry: (entry: T, index: number) => ReactNode;
    total?: number;
    loading?: boolean;
    updateQuery?: (query: Partial<DataTableQuery>) => void;
    hideSearch?: boolean;
    searchDebounce?: number;
}

export function DataGridView<T extends DataGridViewEntry>(
    props: DataGridViewProps<T>
) {
    const {
        emptyText,
        entries = [],
        fields = [],
        total = 0,
        filterActions,
        renderPlaceholder = () => (
            <Skeleton
                variant="rectangular"
                sx={{
                    borderRadius: (theme) => `${theme.shape.borderRadius}px `,
                }}
            />
        ),
        renderEntry,
        loading = false,
        updateQuery = (_: Partial<DataTableQuery>) => void 0,
        page,
        pageSize,
        orderBy,
        order,
        term,
        searchDebounce = 500,
    } = props;

    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState<string>(term);
    const debouncedSearchTerm = useDebounce(searchTerm, searchDebounce);

    const handleChangePage = async (newPage: number) => {
        updateQuery({ page: newPage });
    };

    const handleChangeItemsPerPage = async (newPageSize: number) => {
        if (newPageSize === pageSize) {
            return;
        }
        updateQuery({
            pageSize: newPageSize,
        });
    };

    const handleChangeOrderBy = (event) => {
        updateQuery({
            orderBy: event.target.value,
            page: 1,
        });
    };

    const handleChangeOrder = (event) => {
        updateQuery({
            order: event.target.value,
            page: 1,
        });
    };

    useEffect(() => {
        // only update if the term actually changed
        if (term === debouncedSearchTerm?.trim()) {
            return;
        }
        updateQuery({ term: debouncedSearchTerm, page: 1 });
    }, [debouncedSearchTerm]);

    const nrItems = entries?.length || pageSize;

    return (
        <Grid container direction="column">
            <Grid item xs={12}>
                <Grid container direction="row" spacing={1}>
                    {filterActions && (
                        <Grid item xs>
                            {filterActions}
                        </Grid>
                    )}
                    <Grid item xs>
                        <Box flexGrow="1" />
                    </Grid>
                    <Grid item xs>
                        <Stack spacing={1} alignItems="flex-end">
                            <SearchField
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                variant="outlined"
                                size="small"
                            />
                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                            >
                                <Typography
                                    variant="body2"
                                    style={{ paddingTop: 6, paddingBottom: 7 }}
                                >
                                    {t("orderBy")}
                                </Typography>
                                <Select
                                    sx={{
                                        fontSize: (theme) =>
                                            theme.typography.body2.fontSize,
                                    }}
                                    value={orderBy}
                                    onChange={handleChangeOrderBy}
                                    disableUnderline
                                    variant="standard"
                                >
                                    {fields.map((field) => {
                                        return (
                                            <MenuItem
                                                key={`f_${field.field}`}
                                                selected={
                                                    orderBy === field.field
                                                }
                                                value={field.field}
                                            >
                                                {field.title}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                                <Select
                                    sx={{
                                        fontSize: (theme) =>
                                            theme.typography.body2.fontSize,
                                    }}
                                    value={order}
                                    onChange={handleChangeOrder}
                                    disableUnderline
                                    variant="standard"
                                >
                                    <MenuItem
                                        selected={order === SortingOrder.asc}
                                        value={SortingOrder.asc}
                                    >
                                        {t("ascending")}
                                    </MenuItem>
                                    <MenuItem
                                        selected={orderBy === SortingOrder.desc}
                                        value={SortingOrder.desc}
                                    >
                                        {t("descending")}
                                    </MenuItem>
                                </Select>
                            </Stack>
                        </Stack>
                    </Grid>
                </Grid>
            </Grid>

            <Grid item xs={12}>
                <Grid container spacing={1}>
                    {!loading && entries.length === 0 && (
                        <Grid item xs={12}>
                            <Typography>
                                {emptyText || t("noEntriesFound")}
                            </Typography>
                        </Grid>
                    )}
                    {!loading &&
                        entries.map((entry, index) => (
                            <Grid
                                item
                                key={entry.id}
                                xs={12}
                                md={6}
                                lg={4}
                                xl={3}
                            >
                                {renderEntry(entry, index)}
                            </Grid>
                        ))}
                    {loading &&
                        [...Array(nrItems)].map((e, i) => (
                            <Grid
                                item
                                key={`placeholder_${i}`}
                                xs={12}
                                md={6}
                                lg={4}
                                xl={3}
                            >
                                {renderPlaceholder()}
                            </Grid>
                        ))}
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <DataGridViewPagination
                    total={total}
                    itemsPerPage={pageSize}
                    page={page}
                    onChangePage={handleChangePage}
                    onChangeItemsPerPage={handleChangeItemsPerPage}
                />
            </Grid>
        </Grid>
    );
}
