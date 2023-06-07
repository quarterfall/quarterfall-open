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
import { StudentsIcon } from "components/icons";
import { ellipsis } from "core";
import { User } from "interface/User.interface";
import { useTranslation } from "react-i18next";

export interface StudentFilterProps {
    users: User[];
    selectedUsers: User[];
    onChangeSelected?: (items: User[]) => void;
    onDeleteFilter?: () => void;
}

export function StudentFilter(props: StudentFilterProps) {
    const {
        users,
        selectedUsers,
        onChangeSelected = (_: User[]) => void 0,
        onDeleteFilter = () => void 0,
    } = props;
    const { t } = useTranslation();

    const handleChange = (event, value: User[], reason: string) => {
        onChangeSelected(value);
    };

    const getUserLabel = (user: User) => {
        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
        } else {
            return `${user.emailAddress}`;
        }
    };

    return (
        <Grid container spacing={1} alignItems="center" wrap="nowrap">
            <Grid item>
                <StudentsIcon color="disabled" />
            </Grid>
            <Grid item style={{ flexGrow: 1 }}>
                <Autocomplete
                    multiple
                    fullWidth
                    id="tags-outlined"
                    options={users}
                    getOptionLabel={(option: User) =>
                        ellipsis(getUserLabel(option))
                    }
                    value={selectedUsers}
                    onChange={handleChange}
                    disableCloseOnSelect
                    limitTags={5}
                    noOptionsText={t("noOptions")}
                    renderOption={(props, option, { selected }) => (
                        <ListItem {...props}>
                            <ListItemIcon>
                                <Checkbox color="primary" checked={selected} />
                            </ListItemIcon>
                            <ListItemText primary={getUserLabel(option)} />
                        </ListItem>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            label={t("filterByStudent")}
                            placeholder={t("students")}
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
