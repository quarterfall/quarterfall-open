import DeleteIcon from "@mui/icons-material/Delete";
import {
    Box,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import { ellipsis } from "core";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CircledNumberIcon } from "ui/CircledNumberIcon";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { useNavigation } from "ui/route/Navigation";
import { useDeleteBlock } from "../api/Assignment.data";

type Props = {
    block?: Block;
    assignment?: Assignment;
    index?: number;
    title?: string;
    selected?: boolean;
};

export const AssignmentSidebarQuestionListItem = (props: Props) => {
    const { block, assignment, selected, title, index } = props;

    const { t } = useTranslation();
    const router = useNavigation();
    const { showErrorToast, showSuccessToast } = useToast();

    const handleClickNavigateToAssignment = () => {
        setShowDeleteIcon(false);
        setShowDeleteQuestionDialogOpen(false);
        router.push(`/assignment/${assignment.id}`, undefined, {
            shallow: true,
        });
    };

    const [showDeleteButton, setShowDeleteIcon] = useState(false);
    const [showDeleteQuestionDialog, setShowDeleteQuestionDialogOpen] =
        useState(false);
    const [deleteBlockMutation] = useDeleteBlock();

    return (
        <ListItem
            button
            dense
            sx={{ paddingLeft: 4 }}
            autoFocus={selected}
            selected={selected}
            onClick={() =>
                router.push(
                    `/assignment/${assignment.id}/questions/${block.id}`
                )
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
                                setShowDeleteQuestionDialogOpen(true);
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
            <ListItemIcon>
                <CircledNumberIcon
                    index={index + 1}
                    color={selected ? "primary" : "disabled"}
                />
            </ListItemIcon>
            <ListItemText
                primary={ellipsis(title, 20)}
                sx={{ wordBreak: "break-word" }}
            />
            <ConfirmationDialog
                open={showDeleteQuestionDialog}
                title={t("assignment:confirmDeleteQuestionTitle")}
                message={t("assignment:confirmDeleteQuestionMessage")}
                onContinue={async () => {
                    await deleteBlockMutation({
                        variables: {
                            id: block.id,
                        },
                    });
                    handleClickNavigateToAssignment();
                    showSuccessToast();
                }}
                onCancel={() => {
                    setShowDeleteIcon(false);
                    setShowDeleteQuestionDialogOpen(false);
                }}
            />
        </ListItem>
    );
};
