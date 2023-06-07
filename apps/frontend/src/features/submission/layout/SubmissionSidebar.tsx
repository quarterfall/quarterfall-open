import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ViewComfyIcon from "@mui/icons-material/ViewComfy";
import {
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
} from "@mui/material";
import { BlockType, ellipsis } from "core";
import { Submission } from "interface/Submission.interface";
import { useTranslation } from "react-i18next";
import { CircledNumberIcon } from "ui/CircledNumberIcon";
import { useNavigation } from "ui/route/Navigation";
import { SubmissionSidebarHeader } from "./SubmissionSidebarHeader";

export type SubmissionSidebarItem = "overview" | "questions" | "comment";

export interface SubmissionSidebarProps {
    selected?: SubmissionSidebarItem;
    questionId?: string;
    submission: Submission;
    showGradingActions?: boolean;
}

export function SubmissionSidebar(props: SubmissionSidebarProps) {
    const { selected, submission, questionId, showGradingActions } = props;
    const { t } = useTranslation();
    const router = useNavigation();

    const assignment = submission?.assignment;
    const blocks = assignment?.blocks || [];

    const handleClickBack = () => {
        router.push(
            `/assignment/${assignment.id}/${
                showGradingActions ? "grading" : "submissions"
            }`
        );
    };

    return (
        <>
            <SubmissionSidebarHeader submission={submission} />
            <List style={{ padding: 0 }}>
                <ListItem button onClick={handleClickBack}>
                    <ListItemIcon>
                        <ChevronLeftIcon />
                    </ListItemIcon>
                    <ListItemText
                        disableTypography
                        primary={
                            <Typography variant="button">
                                {showGradingActions
                                    ? t("grading")
                                    : t("submissions")}
                            </Typography>
                        }
                    />
                </ListItem>
                <Divider />
                <ListItem
                    button
                    selected={selected === "overview"}
                    onClick={() => {
                        router.push(
                            `/${
                                showGradingActions ? "grading" : "submission"
                            }/${submission.id}`
                        );
                    }}
                >
                    <ListItemIcon>
                        <ViewComfyIcon />
                    </ListItemIcon>
                    <ListItemText>{t("submission:overview")}</ListItemText>
                </ListItem>
                {blocks?.map((block, index) => {
                    const questionTitle =
                        block?.title ||
                        `${t("assignment:question")} ${block.index + 1}`;

                    const questionScore = block?.feedback?.score?.toString();
                    const questionIsChecked = assignment?.hasGrading
                        ? block.isAssessed
                        : block.completed;
                    return (
                        <ListItem
                            key={index}
                            button
                            dense
                            selected={questionId === block.id}
                            onClick={() => {
                                router.push(
                                    `/${
                                        showGradingActions
                                            ? "grading"
                                            : "submission"
                                    }/${submission.id}/questions/${block.id}`
                                );
                            }}
                        >
                            <ListItemIcon>
                                {questionIsChecked ? (
                                    <CheckCircleIcon color="secondary" />
                                ) : (
                                    <CircledNumberIcon index={index + 1} />
                                )}
                            </ListItemIcon>
                            <ListItemText
                                primary={ellipsis(`${questionTitle}`, 20)}
                                secondary={
                                    assignment?.hasGrading &&
                                    block.type !== BlockType.Text &&
                                    `${t("submission:score")}: ${
                                        questionScore ? questionScore : "-"
                                    }`
                                }
                            ></ListItemText>
                        </ListItem>
                    );
                })}
            </List>
        </>
    );
}
