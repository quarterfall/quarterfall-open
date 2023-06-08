import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import MoveDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoveUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Collapse,
    darken,
    Divider,
    IconButton,
    lighten,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
} from "@mui/material";
import { Permission } from "core";
import {
    useDeleteAction,
    useDuplicateAction,
    useMoveActionToIndex,
} from "features/question/staff/Question.data";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Action } from "interface/Action.interface";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import DuplicateIcon from "mdi-material-ui/ContentDuplicate";
import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { WaitingDialog } from "ui/dialog/WaitingDialog";
import { InsertActionDialog } from "./InsertActionDialog";

export interface SummaryCardActionProps {
    title: string;
    subtitle?: string;
    avatar?: ReactNode;
    assignment: Assignment;
    block: Block;
    action: Action;
    disableMoveUp?: boolean;
    disableMoveDown?: boolean;
    index: number;
    advanced?: ReactNode;
    children: ReactNode;
}

export function SummaryCardAction(props: SummaryCardActionProps) {
    const {
        title,
        subtitle,
        avatar,
        assignment,
        block,
        action,
        children,
        disableMoveDown,
        disableMoveUp,
        index,
        advanced,
        ...rest
    } = props;
    const { t } = useTranslation();
    const { showSuccessToast } = useToast();
    const can = usePermission();
    const module = assignment?.module;
    const course = module?.course;
    const readOnly = !can(Permission.updateCourse, course);

    const [anchorEl, setAnchorEl] = useState(null);
    const [confirmDeleteAction, setConfirmDeleteAction] = useState(false);
    const [duplicateActionDialogOpen, setDuplicateActionDialogOpen] =
        useState(false);
    const [insertActionDialogOpen, setInsertActionDialogOpen] = useState(false);
    const [deleteActionMutation] = useDeleteAction();
    const [duplicateActionMutation] = useDuplicateAction();
    const [moveActionToIndexMutation] = useMoveActionToIndex();
    const [expanded, setExpanded] = useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const handleClickOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClickDelete = () => {
        setConfirmDeleteAction(true);
        setAnchorEl(null);
    };
    const handleClickDuplicate = async () => {
        setDuplicateActionDialogOpen(true);
        await duplicateActionMutation({
            variables: {
                id: action.id,
                keepIndex: false,
            },
        });
        setDuplicateActionDialogOpen(false);
        showSuccessToast(t("assignment:duplicatedActionConfirmation"));

        setAnchorEl(null);
    };

    const handleClickInsert = () => {
        setInsertActionDialogOpen(true);
        setAnchorEl(null);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMoveUp = () => {
        moveActionToIndexMutation({
            variables: {
                id: action.id,
                index: index - 1,
            },
        });
        setAnchorEl(null);
    };

    const handleMoveDown = () => {
        moveActionToIndexMutation({
            variables: {
                id: action.id,
                index: index + 1,
            },
        });
        setAnchorEl(null);
    };

    return (
        <Card
            sx={{
                width: "100%",
                backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                        ? lighten(theme.palette.background.paper, 0.15)
                        : darken(theme.palette.background.paper, 0.1),
                overflow: "visible",
            }}
            {...rest}
        >
            <CardHeader
                title={title}
                subheader={subtitle}
                avatar={avatar}
                action={
                    !readOnly && (
                        <IconButton
                            data-cy={`menuButton_${action?.id}`}
                            aria-label="action-menu"
                            onClick={handleClickOpenMenu}
                            size="large"
                        >
                            <MoreVertIcon />
                        </IconButton>
                    )
                }
            />
            <CardContent style={{ paddingTop: 0 }}>{children}</CardContent>
            {advanced && (
                <>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <CardContent>{advanced}</CardContent>
                    </Collapse>
                    <CardActions
                        style={{
                            paddingTop: 0,
                            justifyContent: "flex-end",
                        }}
                    >
                        <Button
                            endIcon={
                                expanded ? <MoveUpIcon /> : <MoveDownIcon />
                            }
                            onClick={handleExpandClick}
                        >
                            {expanded ? t("hideOptions") : t("advancedOptions")}
                        </Button>
                    </CardActions>
                </>
            )}
            {/* Menu */}
            <Menu
                id="summary-card-content-actions-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem
                    onClick={handleClickInsert}
                    data-cy={`duplicateButton_${action?.id}`}
                >
                    <ListItemIcon>
                        <AddIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("assignment:titleInsertAction")} />
                </MenuItem>
                <MenuItem
                    onClick={handleClickDuplicate}
                    data-cy={`duplicateButton_${action?.id}`}
                >
                    <ListItemIcon>
                        <DuplicateIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("duplicate")} />
                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={handleMoveUp}
                    disabled={disableMoveUp}
                    data-cy={`moveUpButton_${action?.id}`}
                >
                    <ListItemIcon>
                        <MoveUpIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("moveUp")} />
                </MenuItem>
                <MenuItem
                    onClick={handleMoveDown}
                    disabled={disableMoveDown}
                    data-cy={`moveDownButton_${action?.id}`}
                >
                    <ListItemIcon>
                        <MoveDownIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("moveDown")} />
                </MenuItem>
                <MenuItem
                    onClick={handleClickDelete}
                    data-cy={`deleteButton_${action?.id}`}
                >
                    <ListItemIcon sx={{ color: "error.main" }}>
                        <DeleteIcon />
                    </ListItemIcon>
                    <ListItemText
                        sx={{ color: "error.main" }}
                        primary={t("delete")}
                    />
                </MenuItem>
            </Menu>
            {/* Delete action confirmation dialog */}
            <ConfirmationDialog
                open={confirmDeleteAction}
                title={t("assignment:confirmDeleteActionTitle")}
                message={t("assignment:confirmDeleteActionMessage")}
                onContinue={async () => {
                    setConfirmDeleteAction(false);
                    deleteActionMutation({
                        variables: {
                            id: action.id,
                        },
                    });
                }}
                onCancel={() => {
                    setConfirmDeleteAction(false);
                }}
            />
            <InsertActionDialog
                open={insertActionDialogOpen}
                onClose={() => {
                    setInsertActionDialogOpen(false);
                }}
                assignment={assignment}
                block={block}
                beforeIndex={index}
            />
            <WaitingDialog
                open={duplicateActionDialogOpen}
                message={t("assignment:duplicatingActionMessage")}
            />
        </Card>
    );
}
