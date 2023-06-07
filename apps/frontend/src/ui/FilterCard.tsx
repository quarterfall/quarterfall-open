import FilterListIcon from "@mui/icons-material/FilterList";
import { Card, CardContent, CardHeader, Grid } from "@mui/material";
import { DataTableQuery } from "components/dataview/datatable/DataTableQuery";
import { ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "./hooks/Debounce";
import { SearchField } from "./SearchField";

export interface FilterCardProps {
    children?: ReactNode;
    headerActions?: ReactNode;
    hasSearchBar?: boolean;
    term?: string;
    searchDebounce?: number;
    updateQuery?: (query: Partial<DataTableQuery>) => void;
}

export function FilterCard(props: FilterCardProps) {
    const {
        children,
        headerActions,
        hasSearchBar = false,
        term,
        searchDebounce = 500,
        updateQuery = (_: Partial<DataTableQuery>) => void 0,
    } = props;
    const { t } = useTranslation();

    const [searchTerm, setSearchTerm] = useState<string>(term);
    const debouncedSearchTerm = useDebounce(searchTerm, searchDebounce);

    useEffect(() => {
        // only update if the term actually changed
        if (term === debouncedSearchTerm?.trim()) {
            return;
        }
        updateQuery({ term: debouncedSearchTerm, page: 1 });
    }, [debouncedSearchTerm]);

    return (
        <Card>
            <CardHeader
                sx={{ paddingBottom: 0 }}
                avatar={<FilterListIcon color="disabled" />}
                title={t("filters")}
                action={headerActions}
            />
            <CardContent>
                <Grid
                    container
                    spacing={3}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Grid item xs>
                        {children}
                    </Grid>
                    {hasSearchBar && (
                        <Grid item>
                            <SearchField
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                variant="outlined"
                                size="small"
                            />
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
}
