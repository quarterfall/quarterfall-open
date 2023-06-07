import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoveDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoveUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TimelineIcon from "@mui/icons-material/Timeline";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Checkbox,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Skeleton,
    Typography,
} from "@mui/material";
import { AnalyticsBlock } from "interface/AnalyticsBlock.interface";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));

export interface AnalyticsBlockCardProps {
    block: AnalyticsBlock;
    disableMoveUp?: boolean;
    disableMoveDown?: boolean;
    preview?: boolean;
    computing?: boolean;
    onCompute?: () => void;
    result?: string;
    onClickEdit?: () => void;
    onClickToggleFullWidth: () => void;
    onMoveDown: () => void;
    onMoveUp: () => void;
    onDelete: () => void;
}

export function AnalyticsBlockCard(props: AnalyticsBlockCardProps) {
    const { t } = useTranslation();
    const {
        block,
        preview,
        computing,
        onCompute,
        disableMoveUp,
        disableMoveDown,
        result = "",
        onClickEdit,
        onClickToggleFullWidth,
        onMoveDown,
        onMoveUp,
        onDelete,
    } = props;

    const [anchorEl, setAnchorEl] = useState(null);
    const [confirmDeleteBlock, setConfirmDeleteBlock] = useState(false);

    const handleClickOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleClickDelete = async () => {
        setAnchorEl(null);
        setConfirmDeleteBlock(true);
    };

    const handleDelete = async () => {
        setConfirmDeleteBlock(false);
        onDelete();
    };

    const handleMoveUp = () => {
        onMoveUp();
        setAnchorEl(null);
    };

    const handleMoveDown = () => {
        onMoveDown();
        setAnchorEl(null);
    };

    const handleClickToggleFullWidth = async () => {
        setAnchorEl(null);
        onClickToggleFullWidth();
    };

    return (
        <>
            <Card
                sx={{
                    width: "100%",
                    height: "100%",
                    background: "background.default",
                }}
            >
                <CardHeader
                    title={
                        <Typography variant="h6" fontWeight="regular">
                            {block?.title
                                ? t(block.title)
                                : t("analytics:block")}
                        </Typography>
                    }
                    action={
                        !preview ? (
                            <IconButton
                                aria-label="analytics-block-menu"
                                onClick={handleClickOpenMenu}
                                size="small"
                            >
                                <MoreVertIcon />
                            </IconButton>
                        ) : undefined
                    }
                    sx={{
                        paddingTop: 2,
                        paddingBottom: 0,
                    }}
                />
                <CardContent
                    sx={{
                        paddingBottom: 2,
                        paddingTop: 0,
                    }}
                >
                    {!computing && (
                        <Markdown>
                            {result ? result : t("analytics:noDataToDisplay")}
                        </Markdown>
                    )}
                    {computing && (
                        <Skeleton
                            variant="rectangular"
                            sx={{
                                borderRadius: (theme) =>
                                    `${theme.shape.borderRadius}px `,
                                width: "100%",
                                height: 300,
                            }}
                        />
                    )}
                    {preview && !computing && onCompute && (
                        <Align right>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    onCompute();
                                }}
                                startIcon={<TimelineIcon />}
                                style={{ marginTop: 8 }}
                            >
                                {t("analytics:computeAnalytics")}
                            </Button>
                        </Align>
                    )}
                </CardContent>
            </Card>
            {/* Menu */}
            <Menu
                id="analytics-block-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={handleClickToggleFullWidth}>
                    <ListItemIcon>
                        <Checkbox
                            color="primary"
                            style={{ padding: 0 }}
                            checked={block.fullWidth || false}
                        />
                    </ListItemIcon>
                    <ListItemText primary={t("analytics:fullWidth")} />
                </MenuItem>
                <Divider />
                {Boolean(onClickEdit) && (
                    <MenuItem onClick={onClickEdit}>
                        <ListItemIcon>
                            <EditIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("edit")} />
                    </MenuItem>
                )}
                <MenuItem onClick={handleMoveUp} disabled={disableMoveUp}>
                    <ListItemIcon>
                        <MoveUpIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("moveUp")} />
                </MenuItem>
                <MenuItem onClick={handleMoveDown} disabled={disableMoveDown}>
                    <ListItemIcon>
                        <MoveDownIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("moveDown")} />
                </MenuItem>
                <MenuItem onClick={handleClickDelete}>
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
            {/* Delete block confirmation dialog */}
            <ConfirmationDialog
                open={confirmDeleteBlock}
                title={t("analytics:confirmDeleteBlockTitle")}
                message={t("analytics:confirmDeleteBlockMessage")}
                onContinue={handleDelete}
                onCancel={() => {
                    setConfirmDeleteBlock(false);
                }}
            />
        </>
    );
}
