import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoveDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoveUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
    CardContent,
    CardHeader,
    Divider,
    Grid,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
    Typography,
} from "@mui/material";
import { BlockType, Permission } from "core";
import {
    useCopyBlock,
    useDeleteBlock,
    useMoveBlockToIndex,
} from "features/assignment/staff/api/Assignment.data";
import { usePermission } from "hooks/usePermission";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import DuplicateIcon from "mdi-material-ui/ContentDuplicate";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { CardWithBackground } from "ui/CardWithBackground";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { useNavigation } from "ui/route/Navigation";
import { InsertQuestionDialog } from "./menu/InsertQuestionDialog";

export interface QuestionCardProps {
    assignment: Assignment;
    block: Block;
}

export const QuestionCard = (props: QuestionCardProps) => {
    const { assignment, block } = props;
    const { t } = useTranslation();
    const router = useNavigation();
    const can = usePermission();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const [confirmDeleteBlock, setConfirmDeleteBlock] = useState(false);
    const [insertBlockDialogOpen, setInsertBlockDialogOpen] = useState(false);
    const [moveBlockToIndexMutation] = useMoveBlockToIndex();
    const [deleteBlockMutation] = useDeleteBlock();
    const [copyBlockMutation] = useCopyBlock();

    const module = assignment?.module;
    const course = module?.course;

    const canUpdate = can(Permission.updateCourse, course);

    const handleClickFullEditMode = (event) => {
        if (anchorEl) {
            return;
        }
        router.push(`/assignment/${assignment.id}/questions/${block.id}`);
    };

    const handleClickOpenMenu = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClickDuplicate = async () => {
        setAnchorEl(null);
        return copyBlockMutation({
            variables: {
                id: block.id,
                keepIndex: false,
            },
        });
    };

    const handleClickInsert = () => {
        setInsertBlockDialogOpen(true);
        setAnchorEl(null);
    };

    const handleMoveUp = () => {
        moveBlockToIndexMutation({
            variables: {
                index: block.index - 1,
                id: block.id,
            },
        });
        setAnchorEl(null);
    };

    const handleMoveDown = () => {
        moveBlockToIndexMutation({
            variables: {
                index: block.index + 1,
                id: block.id,
            },
        });
        setAnchorEl(null);
    };

    const handleClickDelete = () => {
        setConfirmDeleteBlock(true);
        setAnchorEl(null);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <CardWithBackground
                onClick={handleClickFullEditMode}
                index={block.index + 1}
                clickable
            >
                <CardHeader
                    title={
                        <Typography variant="h5">
                            {block.title
                                ? block.title
                                : `${t("assignment:question")} ${
                                      block.index + 1
                                  }`}
                        </Typography>
                    }
                    subheader={
                        <Typography variant="inherit">
                            {t(`assignment:blockType_${block.type}`)}
                        </Typography>
                    }
                    action={
                        canUpdate && !course?.archived ? (
                            <div>
                                <Tooltip title={t("edit")}>
                                    <IconButton
                                        onClick={handleClickFullEditMode}
                                        aria-label="edit-block"
                                        size="large"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={t("showMore")}>
                                    <IconButton
                                        aria-label="content-menu"
                                        onClick={handleClickOpenMenu}
                                        size="large"
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        ) : null
                    }
                />

                <CardContent>
                    <Grid container direction="row" spacing={1}>
                        {block.type !== BlockType.Text && (
                            <>
                                <Grid item xs={12} style={{ display: "flex" }}>
                                    {block.solution ? (
                                        <CheckIcon color="success" />
                                    ) : (
                                        <ClearIcon color="error" />
                                    )}
                                    <div style={{ marginLeft: 8 }}>
                                        {block.solution
                                            ? t(
                                                  "assignment:questionGeneratesSolution"
                                              )
                                            : t(
                                                  "assignment:questionDoesNotGenerateSolution"
                                              )}
                                    </div>
                                </Grid>
                                {!assignment?.assessmentType && (
                                    <Grid
                                        item
                                        xs={12}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        {block?.actions.length > 0 ? (
                                            <CheckIcon color="success" />
                                        ) : (
                                            <ClearIcon color="error" />
                                        )}
                                        <div style={{ marginLeft: 8 }}>
                                            {block?.actions.length > 0
                                                ? t(
                                                      "assignment:questionGeneratesFeedback"
                                                  )
                                                : t(
                                                      "assignment:questionDoesNotGenerateFeedback"
                                                  )}
                                        </div>
                                    </Grid>
                                )}
                            </>
                        )}
                    </Grid>
                </CardContent>
            </CardWithBackground>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={handleClickInsert}>
                    <ListItemIcon>
                        <AddIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("assignment:insertQuestion")} />
                </MenuItem>
                <MenuItem onClick={handleClickDuplicate}>
                    <ListItemIcon>
                        <DuplicateIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("duplicate")} />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleMoveUp} disabled={block.index === 0}>
                    <ListItemIcon>
                        <MoveUpIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("moveUp")} />
                </MenuItem>
                <MenuItem
                    onClick={handleMoveDown}
                    disabled={block.index >= assignment.blocks.length - 1}
                >
                    <ListItemIcon>
                        <MoveDownIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("moveDown")} />
                </MenuItem>
                <MenuItem onClick={handleClickDelete}>
                    <ListItemIcon sx={{ color: "error.main" }}>
                        <DeleteIcon />
                    </ListItemIcon>
                    <ListItemText
                        sx={{ color: "error.main" }}
                        primary={t("delete")}
                    />
                </MenuItem>
            </Menu>
            {/* Insert content dialog */}
            <InsertQuestionDialog
                open={insertBlockDialogOpen}
                onClose={() => setInsertBlockDialogOpen(false)}
                assignment={assignment}
                beforeBlock={block}
            />
            {/*  Delete block confirmation dialog */}
            <ConfirmationDialog
                open={confirmDeleteBlock}
                title={t("assignment:confirmDeleteQuestionTitle")}
                message={t("assignment:confirmDeleteQuestionMessage")}
                onContinue={async () => {
                    setConfirmDeleteBlock(false);
                    const result = await deleteBlockMutation({
                        variables: {
                            id: block.id,
                        },
                    });

                    const updatedBlocks = result.data.deleteBlock.blocks || [];
                    if (updatedBlocks.length === 1) {
                        router.push(
                            `/assignment/${assignment.id}/questions/${updatedBlocks[0].id}`
                        );
                    }
                }}
                onCancel={() => {
                    setConfirmDeleteBlock(false);
                }}
            />
        </>
    );
};
