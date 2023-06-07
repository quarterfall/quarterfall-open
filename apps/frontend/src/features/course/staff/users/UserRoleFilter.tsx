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
import { RoleType } from "core";
import { useTranslation } from "react-i18next";

export interface UserRoleFilterProps {
    roles: RoleType[];
    selectedRoles: RoleType[];
    onChangeSelectedRoles?: (roles: RoleType[]) => void;
}

export function UserRoleFilter(props: UserRoleFilterProps) {
    const {
        roles,
        selectedRoles = [],
        onChangeSelectedRoles = (_: RoleType[]) => void 0,
    } = props;
    const { t } = useTranslation();

    const handleChange = (event, value: RoleType[], reason: string) => {
        onChangeSelectedRoles(value);
    };

    const handleReset = () => {
        onChangeSelectedRoles(roles);
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
                    options={roles}
                    getOptionLabel={(role: RoleType) => t(`roles:${role}`)}
                    value={selectedRoles}
                    onChange={handleChange}
                    disableCloseOnSelect
                    limitTags={5}
                    noOptionsText={t("noOptions")}
                    renderOption={(props, role, { selected }) => (
                        <ListItem {...props}>
                            <ListItemIcon>
                                <Checkbox color="primary" checked={selected} />
                            </ListItemIcon>
                            <ListItemText primary={t(`roles:${role}`)} />
                        </ListItem>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            label={t("filterByRole")}
                            placeholder={t("roles")}
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
                            disabled={roles === selectedRoles}
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
