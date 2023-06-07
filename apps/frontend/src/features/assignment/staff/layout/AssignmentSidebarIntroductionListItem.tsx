import DeleteIcon from "@mui/icons-material/Delete";
import PinIcon from "@mui/icons-material/PushPin";

import {
    Box,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { useNavigation } from "ui/route/Navigation";
import { useUpdateAssignment } from "../api/Assignment.data";

type Props = {
    assignment?: Assignment;
    selected?: boolean;
};

export const AssignmentSidebarIntroductionListItem = (props: Props) => {
    const { assignment, selected } = props;
    const { showSuccessToast, showErrorToast } = useToast();
    const router = useNavigation();
    const { t } = useTranslation();
    const [showDeleteButton, setShowDeleteIcon] = useState(false);
    const [deleteIntroductionDialogOpen, setDeleteIntroductionDialogOpen] =
        useState(false);
    const [updateAssignmentMutation] = useUpdateAssignment();

    const handleClickNavigateToAssignment = () => {
        setDeleteIntroductionDialogOpen(false);
        setShowDeleteIcon(false);
        router.push(`/assignment/${assignment?.id}`, undefined, {
            shallow: true,
        });
    };
    const handleDeleteIntroduction = async () => {
        try {
            await updateAssignmentMutation({
                variables: {
                    id: assignment?.id,
                    input: { hasIntroduction: false, introduction: "" },
                },
            });
            handleClickNavigateToAssignment();
            showSuccessToast();
        } catch (error) {
            showErrorToast(error);
        }
    };

    return (
        <ListItem
            button
            dense
            sx={{ paddingLeft: 4 }}
            autoFocus={selected}
            selected={selected}
            onClick={() =>
                router.push(`/assignment/${assignment?.id}/introduction`)
            }
            onMouseEnter={() => setShowDeleteIcon(true)}
            onMouseLeave={() => setShowDeleteIcon(false)}
            secondaryAction={
                showDeleteButton ? (
                    <>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                setDeleteIntroductionDialogOpen(true);
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </>
                ) : (
                    // Used as placeholder to prevent content shift
                    <Box />
                )
            }
        >
            <ListItemIcon
                sx={{
                    color: "text.disabled",
                    ...(selected && {
                        color: "primary.main",
                    }),
                }}
            >
                <PinIcon />
            </ListItemIcon>
            <ListItemText>{t("assignment:introduction")}</ListItemText>
            <ConfirmationDialog
                open={deleteIntroductionDialogOpen}
                title={t("assignment:deleteIntroductionTitle")}
                message={t("assignment:deleteIntroductionBody")}
                onContinue={() => {
                    handleClickNavigateToAssignment();
                    handleDeleteIntroduction();
                }}
                onCancel={() => {
                    setDeleteIntroductionDialogOpen(false);
                    setShowDeleteIcon(false);
                }}
            />
        </ListItem>
    );
};
