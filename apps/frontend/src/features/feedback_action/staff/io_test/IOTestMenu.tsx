import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoveDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoveUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
} from "@mui/material";
import {
    useDeleteIOTest,
    useDuplicateIOTest,
    useMoveIOTestToIndex,
} from "features/question/staff/Question.data";
import { useToast } from "hooks/useToast";
import { Action } from "interface/Action.interface";
import { Block } from "interface/Block.interface";
import { IOTest } from "interface/IOTest.interface";
import DuplicateIcon from "mdi-material-ui/ContentDuplicate";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { WaitingDialog } from "ui/dialog/WaitingDialog";
import { EditIOTestDialog } from "./EditIOTestDialog";
import { InsertIOTestDialog } from "./InsertIOTestDialog";

export interface IOTestMenuProps {
    block: Block;
    test: IOTest;
    action: Action;
    index?: number;
}

export const IOTestMenu = (props: IOTestMenuProps) => {
    const { block, test, action, index } = props;
    const { t } = useTranslation();
    const { showSuccessToast } = useToast();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const [moveIOTestToIndexMutation] = useMoveIOTestToIndex();
    const [duplicateIOTestMutation] = useDuplicateIOTest();
    const [deleteIOTestMutation] = useDeleteIOTest();

    const [editIOTestDialogOpen, setEditIOTestDialogOpen] = useState(false);
    const [duplicateIOTestDialogOpen, setDuplicateIOTestDialogOpen] =
        useState(false);
    const [insertIOTestDialogOpen, setInsertIOTestDialogOpen] = useState(false);
    const [deleteIOTestDialogOpen, setDeleteIOTestDialogOpen] = useState(false);

    const handleClickEdit = () => {
        setAnchorEl(null);
        setEditIOTestDialogOpen(true);
    };
    const handleClickInsert = () => {
        setAnchorEl(null);
        setInsertIOTestDialogOpen(true);
    };

    const handleDelete = async () => {
        setAnchorEl(null);
        setDeleteIOTestDialogOpen(false);
        // update the action
        await deleteIOTestMutation({
            variables: {
                id: test.id,
                actionId: action.id,
            },
        });
        showSuccessToast(
            t("assignment:unitTestDeletedNotification", {
                testName: test ? test.name : "",
            })
        );
    };
    const handleMoveUp = () => {
        setAnchorEl(null);
        moveIOTestToIndexMutation({
            variables: {
                id: test.id,
                actionId: action.id,
                index: index - 1,
            },
        });
    };

    const handleMoveDown = () => {
        setAnchorEl(null);
        moveIOTestToIndexMutation({
            variables: {
                id: test.id,
                actionId: action.id,
                index: index + 1,
            },
        });
    };

    const handleClickDuplicate = async () => {
        setAnchorEl(null);
        setDuplicateIOTestDialogOpen(true);
        await duplicateIOTestMutation({
            variables: {
                id: test.id,
                actionId: action.id,
            },
        });
        setDuplicateIOTestDialogOpen(false);
        showSuccessToast(t("assignment:duplicatedIOTestConfirmation"));
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
                key={`menu_${test.id}`}
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
                        handleClickEdit();
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
                        handleClickDuplicate();
                    }}
                >
                    <ListItemIcon>
                        <DuplicateIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("duplicate")} />
                </MenuItem>
                <MenuItem
                    onClick={(event) => {
                        event.stopPropagation();
                        handleClickInsert();
                    }}
                >
                    <ListItemIcon>
                        <AddIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("assignment:titleInsertIOTest")} />
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={(event) => {
                        event.stopPropagation();
                        handleMoveUp();
                    }}
                    disabled={index === 0}
                >
                    <ListItemIcon>
                        <MoveUpIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("moveUp")} />
                </MenuItem>
                <MenuItem
                    onClick={(event) => {
                        event.stopPropagation();
                        handleMoveDown();
                    }}
                    disabled={index === action?.tests?.length - 1}
                >
                    <ListItemIcon>
                        <MoveDownIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("moveDown")} />
                </MenuItem>
                <MenuItem
                    onClick={(event) => {
                        event.stopPropagation();
                        setDeleteIOTestDialogOpen(true);
                    }}
                >
                    <ListItemIcon
                        sx={{
                            color: "error.main",
                        }}
                    >
                        <DeleteIcon />
                    </ListItemIcon>
                    <ListItemText
                        sx={{
                            color: "error.main",
                        }}
                        primary={t("delete")}
                    />
                </MenuItem>
            </Menu>
            <EditIOTestDialog
                block={block}
                action={action}
                testId={test ? test.id : ""}
                open={editIOTestDialogOpen}
                onClose={() => {
                    setEditIOTestDialogOpen(false);
                }}
            />
            <InsertIOTestDialog
                block={block}
                action={action}
                beforeIndex={index}
                open={insertIOTestDialogOpen}
                onClose={() => {
                    setInsertIOTestDialogOpen(false);
                }}
            />
            <ConfirmationDialog
                title={t("assignment:confirmDeleteIOTestTitle")}
                message={t("assignment:confirmDeleteIOTestMessage", {
                    testName: test ? test.name : "",
                })}
                open={deleteIOTestDialogOpen}
                onClick={(event) => {
                    setAnchorEl(null);
                    event.stopPropagation();
                }}
                onCancel={() => {
                    setDeleteIOTestDialogOpen(false);
                }}
                onContinue={() => {
                    handleDelete();
                }}
            />
            <WaitingDialog
                open={duplicateIOTestDialogOpen}
                message={t("assignment:duplicatingUnitTestMessage")}
            />
        </>
    );
};
