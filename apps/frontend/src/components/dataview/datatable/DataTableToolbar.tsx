import DeleteIcon from "@mui/icons-material/Delete";
import {
    IconButton,
    lighten,
    Stack,
    Toolbar,
    Tooltip,
    Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { SearchField } from "ui/SearchField";

const titleSx = { flex: "1 1 100%" };

export interface DataTableToolbarProps {
    title?: string;
    hideSearch?: boolean;
    selectedRows?: string[];
    searchTerm?: string;
    onClickDelete?: () => void;
    onSearchChanged?: (term: string) => void;
    rows?: any[];
    toolbarUnselectedComponents?: (rows: any[]) => JSX.Element;
    toolbarSelectedComponents?: (rows: any[]) => JSX.Element;
}

export function DataTableToolbar(props: DataTableToolbarProps) {
    const {
        title = "",
        hideSearch = false,
        selectedRows = [],
        searchTerm = "",
        onClickDelete = () => void 0,
        onSearchChanged = (_: string) => void 0,
        rows,
        toolbarSelectedComponents,
        toolbarUnselectedComponents,
    } = props;
    const { t } = useTranslation();

    const numSelected = selectedRows.length || 0;
    return (
        <Toolbar
            sx={{
                paddingLeft: 2,
                paddingRight: 1,
                justifyContent: "space-between",
                ...(numSelected > 0 && {
                    borderRadius: (theme) => `${theme.shape.borderRadius}px`,
                    backgroundColor: (theme) =>
                        theme.palette.mode === "light"
                            ? lighten(theme.palette.secondary.light, 0.85)
                            : theme.palette.secondary.dark,
                }),
            }}
            data-cy="dataTableToolbar"
        >
            {numSelected > 0 ? (
                <Typography
                    sx={titleSx}
                    color="inherit"
                    variant="subtitle1"
                    component="div"
                >
                    {t("itemsSelected", { count: numSelected })}
                </Typography>
            ) : (
                <Stack>
                    <Typography
                        sx={titleSx}
                        variant="h6"
                        id="tableTitle"
                        component="div"
                    >
                        {title}
                    </Typography>
                    {toolbarUnselectedComponents && (
                        <>{toolbarUnselectedComponents(rows)}</>
                    )}
                </Stack>
            )}

            {numSelected === 0 && !hideSearch && (
                <SearchField
                    value={searchTerm}
                    variant="outlined"
                    size="small"
                    onChange={(event) => onSearchChanged(event.target.value)}
                />
            )}

            {numSelected > 0 && (
                <>
                    {toolbarSelectedComponents && (
                        <>{toolbarSelectedComponents(rows)}</>
                    )}
                    <Tooltip title={t("delete")!}>
                        <IconButton
                            aria-label="delete"
                            onClick={onClickDelete}
                            size="large"
                            data-cy="dataTableToolbarDeleteButton"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </>
            )}
        </Toolbar>
    );
}
