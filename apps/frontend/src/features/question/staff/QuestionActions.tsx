import AddIcon from "@mui/icons-material/Add";
import CloudCheckIcon from "@mui/icons-material/CloudDone";
import IOTestIcon from "@mui/icons-material/CompareArrows";
import CodeIcon from "@mui/icons-material/Computer";
import FeedbackIcon from "@mui/icons-material/Feedback";
import WebhookIcon from "@mui/icons-material/ImportExport";
import UnitTestIcon from "@mui/icons-material/PlaylistAddCheck";
import GradingIcon from "@mui/icons-material/Spellcheck";
import DatabaseIcon from "@mui/icons-material/Storage";
import {
    Button,
    Grid,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
} from "@mui/material";
import {
    ActionType,
    AssessmentType,
    BlockType,
    Permission,
    ProgrammingLanguage,
    supportedLanguagesIOTesting,
    supportedLanguagesUnitTesting,
} from "core";
import { EditActionCloudCheck } from "features/feedback_action/staff/EditActionCloudCheck";
import { EditActionCode } from "features/feedback_action/staff/EditActionCode";
import { EditActionDatabase } from "features/feedback_action/staff/EditActionDatabase";
import { EditActionFeedback } from "features/feedback_action/staff/EditActionFeedback";
import { EditActionScoring } from "features/feedback_action/staff/EditActionScoring";
import { EditActionWebhook } from "features/feedback_action/staff/EditActionWebhook";
import { EditActionIOTest } from "features/feedback_action/staff/io_test/EditActionIOTest";
import { EditActionUnitTest } from "features/feedback_action/staff/unit_test/EditActionUnitTest";
import { usePermission } from "hooks/usePermission";
import { Action } from "interface/Action.interface";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import React from "react";
import { Flipped, Flipper } from "react-flip-toolkit";
import { useTranslation } from "react-i18next";
import { useAddAction } from "./Question.data";

export interface QuestionActionsProps {
    assignment: Assignment;
    block: Block;
}

function renderActionIcon(type: ActionType) {
    switch (type) {
        case ActionType.CloudCheck:
            return <CloudCheckIcon />;
        case ActionType.Code:
            return <CodeIcon />;
        case ActionType.Feedback:
            return <FeedbackIcon />;
        case ActionType.Scoring:
            return <GradingIcon />;
        case ActionType.Webhook:
            return <WebhookIcon />;
        case ActionType.UnitTest:
            return <UnitTestIcon />;
        case ActionType.IOTest:
            return <IOTestIcon />;
        case ActionType.Database:
            return <DatabaseIcon />;
        default:
            return null;
    }
}

export default function QuestionActions(props: QuestionActionsProps) {
    const { assignment, block } = props;
    const actions: Action[] = block.actions || [];
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [addActionMutation] = useAddAction();
    const can = usePermission();

    const module = assignment?.module;
    const course = module?.course;
    const readOnly = !can(Permission.updateCourse, course);

    function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
        setAnchorEl(event.currentTarget);
    }

    const addAction = (type: ActionType) => {
        setAnchorEl(null);
        addActionMutation({
            variables: {
                blockId: block.id,
                type,
                teacherOnly:
                    assignment?.hasGrading &&
                    assignment.assessmentType === AssessmentType.teacher,
            },
        });
    };

    const availableActions: ActionType[] = [
        assignment.assessmentType === AssessmentType.teacher &&
            ActionType.Scoring,
        ActionType.Feedback,
        ActionType.Code,
        ActionType.CloudCheck,
        ActionType.Webhook,
    ].filter(Boolean);

    // add actions specific to code questions
    if (block.type === BlockType.CodeQuestion) {
        // unit test action
        if (
            supportedLanguagesUnitTesting.indexOf(block.programmingLanguage) >=
            0
        ) {
            availableActions.push(ActionType.UnitTest);
        }
        // io test action
        if (
            supportedLanguagesIOTesting.indexOf(block.programmingLanguage) >= 0
        ) {
            availableActions.push(ActionType.IOTest);
        }
        // database action
        if (block.programmingLanguage === ProgrammingLanguage.sql) {
            availableActions.push(ActionType.Database);
        }
    } else if (block.type === BlockType.DatabaseQuestion) {
        // database action
        availableActions.push(ActionType.Database);
    }

    const flipKey = actions.map((action) => action.id).join("-");
    return (
        <Grid container spacing={1} direction="column">
            <Grid item>
                <Flipper flipKey={flipKey}>
                    <Grid container direction="column" spacing={1}>
                        {actions.map((action: Action, index: number) => {
                            const key = `action_${action.id}`;
                            return (
                                <Flipped key={key} flipId={key}>
                                    <Grid item>
                                        {action.type ===
                                            ActionType.CloudCheck && (
                                            <EditActionCloudCheck
                                                index={index}
                                                assignment={assignment}
                                                block={block}
                                                action={action}
                                                disableMoveUp={index === 0}
                                                disableMoveDown={
                                                    index >= actions.length - 1
                                                }
                                            />
                                        )}
                                        {action.type === ActionType.Code && (
                                            <EditActionCode
                                                index={index}
                                                assignment={assignment}
                                                block={block}
                                                action={action}
                                                disableMoveUp={index === 0}
                                                disableMoveDown={
                                                    index >= actions.length - 1
                                                }
                                            />
                                        )}
                                        {action.type === ActionType.Webhook && (
                                            <EditActionWebhook
                                                index={index}
                                                assignment={assignment}
                                                block={block}
                                                action={action}
                                                disableMoveUp={index === 0}
                                                disableMoveDown={
                                                    index >= actions.length - 1
                                                }
                                            />
                                        )}
                                        {action.type ===
                                            ActionType.Feedback && (
                                            <EditActionFeedback
                                                index={index}
                                                assignment={assignment}
                                                block={block}
                                                action={action}
                                                disableMoveUp={index === 0}
                                                disableMoveDown={
                                                    index >= actions.length - 1
                                                }
                                            />
                                        )}
                                        {assignment?.hasGrading &&
                                            action.type ===
                                                ActionType.Scoring && (
                                                <EditActionScoring
                                                    index={index}
                                                    assignment={assignment}
                                                    block={block}
                                                    action={action}
                                                    disableMoveUp={index === 0}
                                                    disableMoveDown={
                                                        index >=
                                                        actions.length - 1
                                                    }
                                                />
                                            )}
                                        {action.type === ActionType.UnitTest &&
                                            block.type ==
                                                BlockType.CodeQuestion &&
                                            (block.programmingLanguage ||
                                                ProgrammingLanguage.other) !=
                                                ProgrammingLanguage.other && (
                                                <EditActionUnitTest
                                                    index={index}
                                                    assignment={assignment}
                                                    block={block}
                                                    action={action}
                                                    disableMoveUp={index === 0}
                                                    disableMoveDown={
                                                        index >=
                                                        actions.length - 1
                                                    }
                                                />
                                            )}
                                        {action.type === ActionType.IOTest &&
                                            block.type ==
                                                BlockType.CodeQuestion &&
                                            (block.programmingLanguage ||
                                                ProgrammingLanguage.other) !=
                                                ProgrammingLanguage.other && (
                                                <EditActionIOTest
                                                    index={index}
                                                    assignment={assignment}
                                                    block={block}
                                                    action={action}
                                                    disableMoveUp={index === 0}
                                                    disableMoveDown={
                                                        index >=
                                                        actions.length - 1
                                                    }
                                                />
                                            )}
                                        {action.type ===
                                            ActionType.Database && (
                                            <EditActionDatabase
                                                index={index}
                                                assignment={assignment}
                                                block={block}
                                                action={action}
                                                disableMoveUp={index === 0}
                                                disableMoveDown={
                                                    index >= actions.length - 1
                                                }
                                            />
                                        )}
                                    </Grid>
                                </Flipped>
                            );
                        })}
                    </Grid>
                </Flipper>
            </Grid>

            {!readOnly && (
                <Grid item>
                    <Button
                        aria-controls="add-action-menu"
                        aria-haspopup="true"
                        onClick={handleClick}
                        size="large"
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                    >
                        {t("assignment:addAction")}
                    </Button>
                </Grid>
            )}

            <Menu
                id="add-action-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                {availableActions.map((actionType) => (
                    <MenuItem
                        onClick={() => addAction(actionType)}
                        key={`actionMenuItem_${actionType}`}
                    >
                        <ListItemIcon>
                            {renderActionIcon(actionType)}
                        </ListItemIcon>
                        <ListItemText
                            primary={t(`assignment:actionType_${actionType}`)}
                        />
                    </MenuItem>
                ))}
            </Menu>
        </Grid>
    );
}
