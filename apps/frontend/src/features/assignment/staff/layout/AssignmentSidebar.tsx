import AddIcon from "@mui/icons-material/Add";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FolderIcon from "@mui/icons-material/Folder";
import NumberedListIcon from "@mui/icons-material/FormatListNumbered";
import AnalyticsIcon from "@mui/icons-material/PieChart";
import PinIcon from "@mui/icons-material/PushPin";
import SettingsIcon from "@mui/icons-material/Settings";
import GradingIcon from "@mui/icons-material/Spellcheck";
import {
    Badge,
    Box,
    Collapse,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
    Typography,
} from "@mui/material";
import { BlockIcon } from "components/icons";
import { BlockType, Permission } from "core";
import {
    useAddBlock,
    useUpdateAssignment,
} from "features/assignment/staff/api/Assignment.data";
import { usePermission } from "hooks/usePermission";
import { Assignment } from "interface/Assignment.interface";
import { getLastUsedProgrammingLanguage } from "interface/Block.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "ui/route/Navigation";
import { AssignmentSidebarFooter } from "./AssignmentSidebarFooter";
import { AssignmentSidebarHeader } from "./AssignmentSidebarHeader";
import { AssignmentSidebarIntroductionListItem } from "./AssignmentSidebarIntroductionListItem";
import { AssignmentSidebarQuestionListItem } from "./AssignmentSidebarQuestionListItem";

export type AssignmentSidebarItem =
    | "content"
    | "introduction"
    | "files"
    | "analytics"
    | "submissions"
    | "grading"
    | "settings";

export interface AssignmentSidebarProps {
    selected?: AssignmentSidebarItem;
    blockId?: string;
    assignment: Assignment;
}

export function AssignmentSidebar(props: AssignmentSidebarProps) {
    const { selected, assignment, blockId } = props;

    const { t } = useTranslation();
    const can = usePermission();
    const router = useNavigation();

    const module = assignment?.module;
    const course = module?.course;
    const blocks = assignment?.blocks || [];

    const hasOneQuestion = !assignment?.hasIntroduction && blocks.length <= 1;

    const canUpdate = can(Permission.updateCourse, course);
    const canViewAnalytics = can(Permission.viewAnalytics, course);
    const canUpdateSubmissions = can(Permission.updateSubmission, course);
    const canTestAssignment = can(Permission.testAssignment, course);

    const [updateAssignmentMutation] = useUpdateAssignment();
    const [addBlockMutation] = useAddBlock();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const questionsTabSelected =
        selected === "content" ||
        blocks.some((block) =>
            router.asPath.includes(`/questions/${block.id}`)
        );

    const [questionsTabOpen, setQuestionsTabOpen] = useState(
        !hasOneQuestion && questionsTabSelected
    );

    const handleClick = () => {
        setQuestionsTabOpen(!questionsTabOpen);
    };

    const addIntroduction = async () => {
        setAnchorEl(null);
        await updateAssignmentMutation({
            variables: {
                id: assignment?.id,
                input: { hasIntroduction: true },
            },
        });
        router.push(`/assignment/${assignment.id}/introduction`);
    };

    const addBlock = async (type: BlockType) => {
        setAnchorEl(null);
        const currentBlocks = blocks;
        const input: any = {
            type,
        };
        if (type === BlockType.CodeQuestion) {
            input.programmingLanguage = getLastUsedProgrammingLanguage();
        }

        const results = await addBlockMutation({
            variables: {
                assignmentId: assignment.id,
                input,
            },
        });

        const updatedBlocks = results.data.addBlock.blocks;
        if (updatedBlocks.length === currentBlocks.length + 1) {
            router.push(
                `/assignment/${assignment.id}/questions/${
                    updatedBlocks[updatedBlocks.length - 1].id
                }`
            );
        }
    };
    const allowedBlocks: BlockType[] = [
        BlockType.Text,
        BlockType.CodeQuestion,
        BlockType.OpenQuestion,
        BlockType.MultipleChoiceQuestion,
        BlockType.DatabaseQuestion,
        BlockType.FileUploadQuestion,
    ].filter(Boolean);

    return (
        <Box component="nav">
            <AssignmentSidebarHeader assignment={assignment} />
            <List style={{ paddingTop: 0 }}>
                <ListItem
                    button
                    onClick={
                        course
                            ? () => router.push(`/course/${course.id}/content`)
                            : () => router.push("/")
                    }
                    data-cy="assignmentSidebarBackButton"
                >
                    <ListItemIcon>
                        <ChevronLeftIcon />
                    </ListItemIcon>
                    <ListItemText
                        disableTypography
                        primary={
                            <Typography variant="button">
                                {course ? t("course") : t("home")}
                            </Typography>
                        }
                    />
                </ListItem>
                <Divider />

                <ListItem
                    button
                    autoFocus={selected === "content"}
                    selected={selected === "content"}
                    onClick={() => {
                        if (selected === "content" && !hasOneQuestion) {
                            setQuestionsTabOpen(!questionsTabOpen);
                        } else if (!blocks.length) {
                            return;
                        } else {
                            router.push(
                                `/assignment/${assignment.id}${
                                    hasOneQuestion
                                        ? `/questions/${blocks[0].id}`
                                        : ""
                                }`
                            );
                        }
                    }}
                    data-cy="assignmentSidebarContentTab"
                >
                    <ListItemIcon>
                        <NumberedListIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("assignment:questions")} />
                    {canUpdate &&
                        !(
                            !assignment.hasIntroduction && blocks.length <= 1
                        ) && (
                            <IconButton
                                onClick={(event) => {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    handleClick();
                                }}
                            >
                                {questionsTabOpen ? (
                                    <ExpandLess />
                                ) : (
                                    <ExpandMore />
                                )}
                            </IconButton>
                        )}
                </ListItem>
                {canUpdate &&
                    !(!assignment.hasIntroduction && blocks.length === 1) && (
                        <Collapse
                            in={questionsTabOpen}
                            timeout="auto"
                            unmountOnExit
                        >
                            {assignment?.hasIntroduction && (
                                <AssignmentSidebarIntroductionListItem
                                    assignment={assignment}
                                    selected={selected === "introduction"}
                                />
                            )}
                            {assignment?.blocks.map((block, index) => {
                                const questionTitle =
                                    block.title ||
                                    `${t("assignment:question")} ${
                                        block.index + 1
                                    }`;
                                return (
                                    <Tooltip
                                        key={index}
                                        title={questionTitle}
                                        placement="bottom"
                                    >
                                        <AssignmentSidebarQuestionListItem
                                            assignment={assignment}
                                            block={block}
                                            index={index}
                                            title={questionTitle}
                                            selected={blockId === block?.id}
                                        />
                                    </Tooltip>
                                );
                            })}
                            <ListItem
                                onClick={(event) => {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    setAnchorEl(event.currentTarget);
                                }}
                                dense
                                button
                                sx={{
                                    paddingLeft: 4,
                                    color: (theme) =>
                                        theme.palette.primary.main,
                                }}
                            >
                                <ListItemIcon>
                                    <AddIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={t("add")}
                                    sx={{ textTransform: "uppercase" }}
                                />
                            </ListItem>
                            <Menu
                                id="simple-menu"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "center",
                                }}
                                keepMounted
                                variant="menu"
                                open={Boolean(anchorEl)}
                                onClose={() => setAnchorEl(null)}
                            >
                                {!assignment?.hasIntroduction && (
                                    <>
                                        <MenuItem
                                            key="introduction"
                                            onClick={() => addIntroduction()}
                                        >
                                            <ListItemIcon>
                                                <PinIcon />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={t(
                                                    `assignment:introduction`
                                                )}
                                            />
                                        </MenuItem>
                                    </>
                                )}
                                {allowedBlocks.map((type) => (
                                    <MenuItem
                                        key={`blockType_${type}`}
                                        onClick={() => addBlock(type)}
                                    >
                                        <ListItemIcon>
                                            <BlockIcon type={type} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={t(
                                                `assignment:blockType_${type}`
                                            )}
                                        />
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Collapse>
                    )}

                {canUpdate && (
                    <ListItem
                        button
                        autoFocus={selected === "files"}
                        selected={selected === "files"}
                        onClick={() =>
                            router.push(`/assignment/${assignment.id}/files`)
                        }
                        data-cy="assignmentSidebarFilesTab"
                    >
                        <ListItemIcon>
                            <FolderIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("files")} />
                    </ListItem>
                )}

                {canViewAnalytics && (
                    <ListItem
                        button
                        autoFocus={selected === "analytics"}
                        selected={selected === "analytics"}
                        onClick={() =>
                            router.push(
                                `/assignment/${assignment.id}/analytics`
                            )
                        }
                        data-cy="assignmentSidebarAnalyticsTab"
                    >
                        <ListItemIcon>
                            <AnalyticsIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("analytics")} />
                    </ListItem>
                )}
                {canUpdateSubmissions && (
                    <ListItem
                        button
                        autoFocus={selected === "submissions"}
                        selected={selected === "submissions"}
                        onClick={() =>
                            router.push(
                                `/assignment/${assignment.id}/submissions`
                            )
                        }
                        data-cy="assignmentSidebarSubmissionsTab"
                    >
                        <ListItemIcon>
                            <AssessmentIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("submissions")} />
                    </ListItem>
                )}
                {canUpdateSubmissions && assignment?.hasGrading && (
                    <ListItem
                        button
                        autoFocus={selected === "grading"}
                        selected={selected === "grading"}
                        onClick={() =>
                            router.push(`/assignment/${assignment.id}/grading`)
                        }
                        data-cy="assignmentSidebarGradingTab"
                    >
                        <ListItemIcon>
                            <GradingIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("grading")} />
                        <ListItemSecondaryAction sx={{ paddingRight: 1 }}>
                            <Badge
                                badgeContent={
                                    assignment?.unapprovedSubmissionCount
                                }
                                color="error"
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                )}

                {canUpdate && (
                    <ListItem
                        button
                        autoFocus={selected === "settings"}
                        selected={selected === "settings"}
                        onClick={() =>
                            router.push(`/assignment/${assignment.id}/settings`)
                        }
                        data-cy="assignmentSidebarSettingsTab"
                    >
                        <ListItemIcon>
                            <SettingsIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("settings")} />
                    </ListItem>
                )}
                {canTestAssignment && (
                    <>
                        <Box sx={{ minHeight: 80, flexGrow: 1 }} />
                        <Box
                            sx={{
                                position: "fixed",
                                bottom: 0,
                                left: 0,
                                zIndex: (theme) => theme.zIndex.drawer + 1,
                            }}
                        >
                            <AssignmentSidebarFooter assignment={assignment} />
                        </Box>
                    </>
                )}
            </List>
        </Box>
    );
}
