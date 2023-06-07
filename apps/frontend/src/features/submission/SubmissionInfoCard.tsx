import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import ScheduleIcon from "@mui/icons-material/Schedule";
import GradingIcon from "@mui/icons-material/Spellcheck";
import {
    Card,
    CardContent,
    CardHeader,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from "@mui/material";
import { AssignmentIcon, ModuleIcon } from "components/icons";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { Submission } from "interface/Submission.interface";
import { User } from "interface/User.interface";
import { useTranslation } from "react-i18next";
import { useDateLocale } from "ui/hooks/DateLocale";
import { useNavigation } from "ui/route/Navigation";

const listIconSx = {
    minWidth: "40px",
};

export interface SubmissionInfoCardProps {
    submission: Submission;
    loading?: boolean;
}

export function SubmissionInfoCard(props: SubmissionInfoCardProps) {
    const { submission, loading } = props;
    const { t } = useTranslation();

    const router = useNavigation();
    const { locale } = useDateLocale();

    const assignment = submission.assignment;
    const module = assignment.module;
    const duration = intervalToDuration({
        start: 0,
        end: submission.time || 0,
    });
    const interval = formatDuration(duration, { locale });

    const assignmentTooltipTitle = (() => {
        if (assignment?.isStudyMaterial) {
            return assignment?.isOptional
                ? t("assignment:optionalStudyMaterial")
                : t("assignment:mandatoryStudyMaterial");
        } else {
            return assignment?.isOptional
                ? t("assignment:optionalAssignment")
                : t("assignment:mandatoryAssignment");
        }
    })();

    const handleClickToAssignment = () => {
        router.push(`/assignment/${assignment.id}`);
    };

    const getUserName = (user: User) => {
        if (user?.firstName && user?.lastName) {
            return `${user?.firstName} ${user?.lastName}`;
        } else {
            return user?.emailAddress;
        }
    };

    return (
        <Card>
            <CardHeader title={t("submission:about")} />
            <CardContent sx={{ paddingTop: 0 }}>
                <Grid container direction="column" spacing={1}>
                    <Grid item>
                        <List dense>
                            <ListItem disableGutters>
                                <Tooltip title={t("student")!}>
                                    <ListItemIcon sx={listIconSx}>
                                        <PersonIcon />
                                    </ListItemIcon>
                                </Tooltip>
                                <ListItemText
                                    primary={getUserName(submission.student)}
                                />
                            </ListItem>
                            <ListItem disableGutters>
                                <Tooltip title={t("module")!}>
                                    <ListItemIcon sx={listIconSx}>
                                        <ModuleIcon />
                                    </ListItemIcon>
                                </Tooltip>
                                <ListItemText primary={module?.title} />
                            </ListItem>
                            <ListItem
                                sx={{
                                    textTransform: "none",
                                    "&:hover": {
                                        cursor: "pointer",
                                        textDecoration: "underline",
                                    },
                                }}
                                onClick={handleClickToAssignment}
                                disableGutters
                            >
                                <Tooltip title={assignmentTooltipTitle}>
                                    <ListItemIcon sx={listIconSx}>
                                        <AssignmentIcon
                                            assignment={assignment}
                                        />
                                    </ListItemIcon>
                                </Tooltip>
                                <ListItemText primary={assignment?.title} />
                            </ListItem>
                            <ListItem disableGutters>
                                <Tooltip
                                    title={t("submission:submittedOnTooltip")!}
                                >
                                    <ListItemIcon sx={listIconSx}>
                                        <CalendarTodayIcon />
                                    </ListItemIcon>
                                </Tooltip>
                                <ListItemText
                                    primary={t("submission:submittedOnDate", {
                                        date: format(
                                            new Date(submission.submittedDate),
                                            "PPp",
                                            { locale }
                                        ),
                                    })}
                                />
                            </ListItem>
                            {submission.time && (
                                <ListItem disableGutters>
                                    <Tooltip
                                        title={
                                            t("submission:timeSpentTooltip")!
                                        }
                                    >
                                        <ListItemIcon sx={listIconSx}>
                                            <ScheduleIcon />
                                        </ListItemIcon>
                                    </Tooltip>
                                    <ListItemText
                                        primary={t("submission:timeSpent", {
                                            interval,
                                        })}
                                    />
                                </ListItem>
                            )}
                            {assignment?.hasGrading && (
                                <ListItem disableGutters>
                                    <Tooltip
                                        title={t("submission:totalScore")!}
                                    >
                                        <ListItemIcon sx={listIconSx}>
                                            <GradingIcon />
                                        </ListItemIcon>
                                    </Tooltip>
                                    <ListItemText
                                        primary={`${t(
                                            "submission:totalScore"
                                        )}: ${
                                            submission?.score
                                                ? submission?.score
                                                : t("submission:notYetGraded")
                                        }${
                                            submission?.score &&
                                            submission?.score <= 100
                                                ? "/100"
                                                : ""
                                        } `}
                                    />
                                </ListItem>
                            )}
                        </List>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
