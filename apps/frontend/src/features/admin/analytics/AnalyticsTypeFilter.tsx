import RoleIcon from "@mui/icons-material/Policy";
import RestoreIcon from "@mui/icons-material/Restore";
import {
    Autocomplete,
    Checkbox,
    Grid,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText,
    TextField,
    Tooltip,
} from "@mui/material";
import { AnalyticsType } from "core";
import { useTranslation } from "react-i18next";

export interface AnalyticsTypeFilterProps {
    types: AnalyticsType[];
    selectedTypes: AnalyticsType[];
    onChangeSelectedTypes?: (types: AnalyticsType[]) => void;
}

export function AnalyticsTypeFilter(props: AnalyticsTypeFilterProps) {
    const {
        types,
        selectedTypes = [],
        onChangeSelectedTypes = (_: AnalyticsType[]) => void 0,
    } = props;
    const { t } = useTranslation();

    const handleChange = (event, value: AnalyticsType[], reason: string) => {
        onChangeSelectedTypes(value);
    };

    const handleReset = () => {
        onChangeSelectedTypes(types);
    };

    return (
        <Grid container spacing={1} alignItems="center" wrap="nowrap">
            <Grid item>
                <RoleIcon color="disabled" />
            </Grid>
            <Grid item style={{ flexGrow: 1 }}>
                <Autocomplete
                    multiple
                    fullWidth
                    id="tags-outlined"
                    options={types}
                    getOptionLabel={(type: AnalyticsType) =>
                        t(`analytics:type_${type}`)
                    }
                    value={selectedTypes}
                    onChange={handleChange}
                    disableCloseOnSelect
                    limitTags={5}
                    noOptionsText={t("noOptions")}
                    renderOption={(props, type, { selected }) => (
                        <ListItem {...props}>
                            <ListItemIcon>
                                <Checkbox color="primary" checked={selected} />
                            </ListItemIcon>
                            <ListItemText
                                primary={t(`analytics:type_${type}`)}
                            />
                        </ListItem>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            label={t("analytics:filterByType")}
                            placeholder={t("analytics:type")}
                            fullWidth
                        />
                    )}
                />
            </Grid>
            <Grid item>
                <Tooltip title={t("resetFilter")!}>
                    <span>
                        <IconButton
                            onClick={handleReset}
                            disabled={types === selectedTypes}
                            size="large"
                        >
                            <RestoreIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            </Grid>
        </Grid>
    );
}
