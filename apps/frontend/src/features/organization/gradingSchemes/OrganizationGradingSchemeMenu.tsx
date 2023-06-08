import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
} from "@mui/material";
import { useToast } from "hooks/useToast";
import { GradingScheme } from "interface/GradingScheme.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { useDeleteGradingScheme } from "../api/OrganizationGrading.data";
import { EditOrganizationSchemeDialog } from "./EditOrganizationSchemeDialog";

interface OrganizationGradingSchemeMenuProps {
    gradingScheme: GradingScheme;
}

export const OrganizationGradingSchemeMenu = (
    props: OrganizationGradingSchemeMenuProps
) => {
    const { gradingScheme } = props;
    const { t } = useTranslation();
    const { showSuccessToast } = useToast();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [editSchemeDialogOpen, setEditSchemeDialogOpen] = useState(false);

    const [
        deleteOrganizationSchemeDialogOpen,
        setDeleteOrganizationSchemeDialogOpen,
    ] = useState(false);

    const [deleteGradingSchemeMutation] = useDeleteGradingScheme();

    const handleDeleteGradingScheme = async () => {
        await deleteGradingSchemeMutation({
            variables: {
                gradingSchemeId: gradingScheme?.id,
            },
        });
        setAnchorEl(null);
        setDeleteOrganizationSchemeDialogOpen(false);
        showSuccessToast(t("organization:deletedSchemeConfirmation"));
    };

    return (
        <>
            <IconButton
                aria-label="content-menu"
                size="small"
                onClick={(event) => {
                    event.stopPropagation();
                    setAnchorEl(event.currentTarget);
                }}
            >
                <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
                key={`menu_${gradingScheme?.id}`}
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={(event: Event) => {
                    setAnchorEl(null);
                    event.stopPropagation();
                }}
            >
                <MenuItem
                    onClick={(event) => {
                        event.stopPropagation();
                        setEditSchemeDialogOpen(true);
                    }}
                >
                    <ListItemIcon>
                        <EditIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("edit")} />
                </MenuItem>
                <MenuItem
                    onClick={(event) => {
                        event.stopPropagation();
                        setDeleteOrganizationSchemeDialogOpen(true);
                    }}
                >
                    <ListItemIcon sx={{ color: "error.main" }}>
                        <DeleteIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={t("delete")}
                        sx={{ color: "error.main" }}
                    />
                </MenuItem>
            </Menu>
            <EditOrganizationSchemeDialog
                open={editSchemeDialogOpen}
                gradingSchemeId={gradingScheme?.id}
                onClose={() => {
                    setAnchorEl(null);
                    setEditSchemeDialogOpen(false);
                }}
            />
            <ConfirmationDialog
                title={t("organization:confirmDeleteSchemeTitle")}
                message={t("organization:confirmDeleteSchemeMessage")}
                open={deleteOrganizationSchemeDialogOpen}
                onCancel={() => {
                    setAnchorEl(null);
                    setDeleteOrganizationSchemeDialogOpen(false);
                }}
                onContinue={() => {
                    handleDeleteGradingScheme();
                }}
                onClick={(e) => e.stopPropagation()}
            />
        </>
    );
};
