import CloudCheckIcon from "@mui/icons-material/CloudDone";
import IOTestIcon from "@mui/icons-material/CompareArrows";
import CodeIcon from "@mui/icons-material/Computer";
import FeedbackIcon from "@mui/icons-material/Feedback";
import WebhookIcon from "@mui/icons-material/ImportExport";
import UnitTestIcon from "@mui/icons-material/PlaylistAddCheck";
import DatabaseIcon from "@mui/icons-material/Storage";
import { Container, Grid, Stack, Typography } from "@mui/material";
import {
    ActionType,
    AssessmentType,
    BlockType,
    ProgrammingLanguage,
    supportedLanguagesIOTesting,
    supportedLanguagesUnitTesting,
} from "core";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { useTranslation } from "react-i18next";
import { ClickableCard } from "ui/ClickableCard";
import { useAddAction } from "./Question.data";

interface QuestionActionsEmptyProps {
    assignment: Assignment;
    block: Block;
}

function renderActionIcon(type: ActionType) {
    switch (type) {
        case ActionType.CloudCheck:
            return <CloudCheckIcon color="primary" fontSize="large" />;
        case ActionType.Code:
            return <CodeIcon color="primary" fontSize="large" />;
        case ActionType.Feedback:
            return <FeedbackIcon color="primary" fontSize="large" />;
        case ActionType.Webhook:
            return <WebhookIcon color="primary" fontSize="large" />;
        case ActionType.UnitTest:
            return <UnitTestIcon color="primary" fontSize="large" />;
        case ActionType.IOTest:
            return <IOTestIcon color="primary" fontSize="large" />;
        case ActionType.Database:
            return <DatabaseIcon color="primary" fontSize="large" />;

        default:
            return null;
    }
}

export function QuestionActionsEmpty(props: QuestionActionsEmptyProps) {
    const { assignment, block } = props;
    const { t } = useTranslation();
    const [addActionMutation] = useAddAction();

    const addAction = (type: ActionType) => {
        addActionMutation({
            variables: {
                blockId: block.id,
                type,
                teacherOnly: assignment?.hasGrading,
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

    return (
        <Container maxWidth="sm" sx={{ padding: 3 }}>
            <Grid
                container
                spacing={2}
                justifyContent={
                    availableActions.length % 2 !== 0 ? "center" : "flex-start"
                }
            >
                <Grid item xs={12}>
                    <Typography>{t("assignment:questionNoActions")}</Typography>
                </Grid>
                {availableActions.map((type) => (
                    <Grid item sm={12} md={6} key={`actionType_${type}`}>
                        <ClickableCard
                            data-cy={`addActionType_${type}`}
                            variant="outlined"
                            onClick={() => addAction(type)}
                            sx={{
                                height: "170px",
                                paddingRight: 1,
                                paddingLeft: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minHeight: "150px",
                                textAlign: "center",
                            }}
                        >
                            <Stack spacing={4} alignItems="center">
                                {renderActionIcon(type)}
                                <Typography variant="button">
                                    {t(`assignment:addActionType_${type}`)}
                                </Typography>
                            </Stack>
                        </ClickableCard>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}
