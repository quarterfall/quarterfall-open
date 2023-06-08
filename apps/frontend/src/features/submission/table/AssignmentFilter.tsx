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
import { AssignmentIcon } from "components/icons";
import { ellipsis } from "core";
import { Assignment } from "interface/Assignment.interface";
import { Module } from "interface/Module.interface";
import { useTranslation } from "react-i18next";

export interface AssignmentFilterProps {
    modules: Module[];
    assignments: Assignment[];
    selectedAssignments: Assignment[];
    onChangeSelectedAssignments?: (assignments: Assignment[]) => void;
    onDeleteFilter?: () => void;
}

export function AssignmentFilter(props: AssignmentFilterProps) {
    const {
        modules = [],
        assignments = [],
        selectedAssignments = [],
        onChangeSelectedAssignments = (_: Assignment[]) => void 0,
        onDeleteFilter = () => void 0,
    } = props;
    const { t } = useTranslation();

    const getModuleTitle = (assignment: Assignment) => {
        for (const module of modules) {
            if (module.assignments.indexOf(assignment) >= 0) {
                return module.title;
            }
        }
        return "";
    };

    const handleChange = (event, value: Assignment[], reason: string) => {
        onChangeSelectedAssignments(value);
    };

    return (
        <Grid container spacing={1} alignItems="center" wrap="nowrap">
            <Grid item>
                <AssignmentIcon color="disabled" />
            </Grid>
            <Grid item style={{ flexGrow: 1 }}>
                <Autocomplete
                    multiple
                    fullWidth
                    id="tags-outlined"
                    options={assignments}
                    getOptionLabel={(assignment: Assignment) =>
                        ellipsis(assignment?.title)
                    }
                    groupBy={(option) => getModuleTitle(option)}
                    value={selectedAssignments}
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
                            label={t("filterByAssignment")}
                            placeholder={t("assignments")}
                            fullWidth
                        />
                    )}
                />
            </Grid>
            <Grid item>
                <Tooltip title={t("removeFilter")!}>
                    <IconButton onClick={onDeleteFilter} size="large">
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            </Grid>
        </Grid>
    );
}
