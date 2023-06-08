import DeleteIcon from "@mui/icons-material/Delete";
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
import { ModuleIcon } from "components/icons";
import { ellipsis } from "core";
import { Module } from "interface/Module.interface";
import { useTranslation } from "react-i18next";

export interface ModuleFilterProps {
    modules: Module[];
    selectedModules: Module[];
    onChangeSelectedModules?: (modules: Module[]) => void;
    onDeleteFilter?: () => void;
}

export function ModuleFilter(props: ModuleFilterProps) {
    const {
        modules,
        selectedModules,
        onChangeSelectedModules = (_: Module[]) => void 0,
        onDeleteFilter = () => void 0,
    } = props;
    const { t } = useTranslation();

    const handleChange = (event, value: Module[], reason: string) => {
        if (onChangeSelectedModules) {
            onChangeSelectedModules(value);
        }
    };

    return (
        <Grid container spacing={1} alignItems="center" wrap="nowrap">
            <Grid item>
                <ModuleIcon color="disabled" />
            </Grid>
            <Grid item style={{ flexGrow: 1 }}>
                <Autocomplete
                    multiple
                    fullWidth
                    id="tags-outlined"
                    options={modules}
                    getOptionLabel={(module: Module) => ellipsis(module.title)}
                    value={selectedModules}
                    onChange={handleChange}
                    disableCloseOnSelect
                    limitTags={5}
                    noOptionsText={t("noOptions")}
                    renderOption={(props, option, { selected }) => (
                        <ListItem {...props}>
                            <ListItemIcon>
                                <Checkbox color="primary" checked={selected} />
                            </ListItemIcon>
                            <ListItemText primary={option.title} />
                        </ListItem>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            label={t("filterByModule")}
                            placeholder={t("modules")}
                            fullWidth
                        />
                    )}
                />
            </Grid>
            <Grid item>
                <Tooltip title={t("removeFilter")}>
                    <IconButton onClick={onDeleteFilter} size="large">
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            </Grid>
        </Grid>
    );
}
