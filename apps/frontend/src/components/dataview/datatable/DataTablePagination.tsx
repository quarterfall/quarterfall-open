import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import { Grid, IconButton, MenuItem, Select, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

export interface DataTablePaginationProps {
    rowsPerPageOptions?: number[];
    total?: number;
    rowsPerPage: number;
    page?: number;
    onChangePage?: (page: number) => void;
    onChangeRowsPerPage?: (rowsPerPage: number) => void;
}

export function DataTablePagination(props: DataTablePaginationProps) {
    const {
        rowsPerPageOptions = [10, 25, 50],
        total = 0,
        rowsPerPage = rowsPerPageOptions[0],
        page = 1,
        onChangePage = (_: number) => void 0,
        onChangeRowsPerPage = (_: number) => void 0,
    } = props;
    const { t } = useTranslation();

    const lastPage = Math.ceil(total / rowsPerPage);
    const firstIndex = Math.min(total, (page - 1) * rowsPerPage + 1);
    const lastIndex = Math.min(total, page * rowsPerPage);

    const handleChangeFirstPage = () => onChangePage(1);
    const handleChangeLastPage = () => onChangePage(lastPage);
    const handleChangeNextPage = () => onChangePage(page + 1);
    const handleChangePreviousPage = () => onChangePage(page - 1);

    const handleChangeRowsPerPage = (event) =>
        onChangeRowsPerPage(parseInt(event.target.value, 10));

    return (
        <Grid
            container
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            sx={{
                padding: 0,
            }}
        >
            <Grid item>
                <Select
                    value={rowsPerPage}
                    sx={{
                        fontSize: (theme) => theme.typography.caption.fontSize,
                    }}
                    onChange={handleChangeRowsPerPage}
                    disableUnderline
                    variant="standard"
                >
                    {rowsPerPageOptions.map((p) => (
                        <MenuItem value={p} key={`pageSize_${p}`} dense>
                            {t("rowsNr", {
                                rows: p,
                            })}
                        </MenuItem>
                    ))}
                </Select>
            </Grid>
            <Grid item>
                <IconButton
                    disabled={page === 1}
                    onClick={handleChangeFirstPage}
                    size="large"
                >
                    <FirstPageIcon />
                </IconButton>
            </Grid>
            <Grid item>
                <IconButton
                    disabled={page === 1}
                    onClick={handleChangePreviousPage}
                    size="large"
                >
                    <ChevronLeftIcon />
                </IconButton>
            </Grid>
            <Grid item>
                <Typography variant="caption">
                    {t("navigationItemsData", {
                        firstIndex,
                        lastIndex,
                        total,
                    })}
                </Typography>
            </Grid>
            <Grid item>
                <IconButton
                    disabled={page >= lastPage}
                    onClick={handleChangeNextPage}
                    size="large"
                >
                    <ChevronRightIcon />
                </IconButton>
            </Grid>
            <Grid item>
                <IconButton
                    disabled={page >= lastPage}
                    onClick={handleChangeLastPage}
                    size="large"
                >
                    <LastPageIcon />
                </IconButton>
            </Grid>
        </Grid>
    );
}
