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
    useDeleteUnitTest,
    useDuplicateUnitTest,
    useMoveUnitTestToIndex,
} from "features/question/staff/Question.data";
import { useToast } from "hooks/useToast";
import { Action } from "interface/Action.interface";
import { Block } from "interface/Block.interface";
import { UnitTest } from "interface/UnitTest.interface";
import DuplicateIcon from "mdi-material-ui/ContentDuplicate";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { WaitingDialog } from "ui/dialog/WaitingDialog";
import { EditUnitTestDialog } from "./EditUnitTestDialog";
import { InsertUnitTestDialog } from "./InsertUnitTestDialog";

export interface UnitTestMenuProps {
    block: Block;
    test: UnitTest;
    action: Action;
    index?: number;
}

export const UnitTestMenu = (props: UnitTestMenuProps) => {
    const { block, test, action, index } = props;
    const { t } = useTranslation();

    const { showSuccessToast } = useToast();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const [moveUnitTestToIndexMutation] = useMoveUnitTestToIndex();
    const [duplicateUnitTestMutation] = useDuplicateUnitTest();
    const [deleteUnitTestMutation] = useDeleteUnitTest();

    const [editUnitTestDialogOpen, setEditUnitTestDialogOpen] = useState(false);
    const [duplicateUnitTestDialogOpen, setDuplicateUnitTestDialogOpen] =
        useState(false);
    const [insertUnitTestDialogOpen, setInsertUnitTestDialogOpen] =
        useState(false);
    const [deleteUnitTestDialogOpen, setDeleteUnitTestDialogOpen] =
        useState(false);

    const handleClickEdit = () => {
        setAnchorEl(null);
        setEditUnitTestDialogOpen(true);
    };
    const handleClickInsert = () => {
        setAnchorEl(null);
        setInsertUnitTestDialogOpen(true);
    };

    const handleDelete = async () => {
        setAnchorEl(null);
        setDeleteUnitTestDialogOpen(false);
        // update the action
        await deleteUnitTestMutation({
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
        moveUnitTestToIndexMutation({
            variables: {
                id: test.id,
                actionId: action.id,
                index: index - 1,
            },
        });
    };

    const handleMoveDown = () => {
        setAnchorEl(null);
        moveUnitTestToIndexMutation({
            variables: {
                id: test.id,
                actionId: action.id,
                index: index + 1,
            },
        });
    };

    const handleClickDuplicate = async () => {
        setAnchorEl(null);
        setDuplicateUnitTestDialogOpen(true);
        await duplicateUnitTestMutation({
            variables: {
                id: test.id,
                actionId: action.id,
            },
        });
        setDuplicateUnitTestDialogOpen(false);
        showSuccessToast(t("assignment:duplicatedUnitTestConfirmation"));
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
                    <ListItemText
                        primary={t("assignment:titleInsertUnitTest")}
                    />
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
                        setDeleteUnitTestDialogOpen(true);
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
            <EditUnitTestDialog
                block={block}
                action={action}
                testId={test ? test.id : ""}
                open={editUnitTestDialogOpen}
                onClose={() => {
                    setEditUnitTestDialogOpen(false);
                }}
            />
            <InsertUnitTestDialog
                block={block}
                action={action}
                beforeIndex={index}
                open={insertUnitTestDialogOpen}
                onClose={() => {
                    setInsertUnitTestDialogOpen(false);
                }}
            />
            <ConfirmationDialog
                title={t("assignment:confirmDeleteUnitTestTitle")}
                message={t("assignment:confirmDeleteUnitTestMessage", {
                    testName: test ? test.name : "",
                })}
                open={deleteUnitTestDialogOpen}
                onClick={(event) => {
                    setAnchorEl(null);
                    event.stopPropagation();
                }}
                onCancel={() => {
                    setDeleteUnitTestDialogOpen(false);
                }}
                onContinue={() => {
                    handleDelete();
                }}
            />
            <WaitingDialog
                open={duplicateUnitTestDialogOpen}
                message={t("assignment:duplicatingUnitTestMessage")}
            />
        </>
    );
};
