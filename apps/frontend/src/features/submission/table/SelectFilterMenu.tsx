import AddIcon from "@mui/icons-material/Add";
import {
    Button,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
} from "@mui/material";
import { AssignmentIcon, ModuleIcon, StudentsIcon } from "components/icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export interface SelectFilterMenuProps {
    hideModuleFilterOption?: boolean;
    hideAssignmentFilterOption?: boolean;
    hideStudentFilterOption?: boolean;
    onAddModuleFilter?: () => void;
    onAddAssignmentFilter?: () => void;
    onEnableStudentFilter?: () => void;
    cardAction?: boolean;
}

export function SelectFilterMenu(props: SelectFilterMenuProps) {
    const {
        hideModuleFilterOption,
        hideAssignmentFilterOption,
        hideStudentFilterOption,
        onAddModuleFilter = () => void 0,
        onAddAssignmentFilter = () => void 0,
        onEnableStudentFilter = () => void 0,
        cardAction,
    } = props;
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState(null);

    // count the number of options
    const optionCount = [
        !hideModuleFilterOption,
        !hideAssignmentFilterOption,
        !hideStudentFilterOption,
    ].filter((v) => v).length;

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleClickEnableModuleFilter = () => {
        setAnchorEl(null);
        onAddModuleFilter();
    };

    const handleClickEnableAssignmentFilter = () => {
        setAnchorEl(null);
        onAddAssignmentFilter();
    };

    const handleClickEnableStudentFilter = () => {
        setAnchorEl(null);
        onEnableStudentFilter();
    };

    return (
        <>
            <Button
                onClick={handleClick}
                disabled={optionCount === 0}
                startIcon={<AddIcon />}
            >
                {t("addFilter")}
            </Button>
            <Menu
                id="select-filter-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {!hideModuleFilterOption && (
                    <MenuItem onClick={handleClickEnableModuleFilter}>
                        <ListItemIcon>
                            <ModuleIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("addModuleFilter")} />
                    </MenuItem>
                )}
                {!hideAssignmentFilterOption && (
                    <MenuItem onClick={handleClickEnableAssignmentFilter}>
                        <ListItemIcon>
                            <AssignmentIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("addAssignmentFilter")} />
                    </MenuItem>
                )}
                {!hideStudentFilterOption && (
                    <MenuItem onClick={handleClickEnableStudentFilter}>
                        <ListItemIcon>
                            <StudentsIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("addStudentFilter")} />
                    </MenuItem>
                )}
            </Menu>
        </>
    );
}
