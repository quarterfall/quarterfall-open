import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import { Grid, IconButton, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

export interface DataGridViewPaginationProps {
    total?: number;
    itemsPerPage: number;
    page?: number;
    onChangePage?: (page: number) => void;
    onChangeItemsPerPage?: (rowsPerPage: number) => void;
}

export function DataGridViewPagination(props: DataGridViewPaginationProps) {
    const {
        total = 0,
        itemsPerPage,
        page = 1,
        onChangePage = (_: number) => void 0,
        onChangeItemsPerPage = (_: number) => void 0,
    } = props;
    const { t } = useTranslation();

    const lastPage = Math.ceil(total / itemsPerPage);
    const firstIndex = Math.min(total, (page - 1) * itemsPerPage + 1);
    const lastIndex = Math.min(total, page * itemsPerPage);

    const handleChangeFirstPage = () => onChangePage(1);
    const handleChangeLastPage = () => onChangePage(lastPage);
    const handleChangeNextPage = () => onChangePage(page + 1);
    const handleChangePreviousPage = () => onChangePage(page - 1);

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
