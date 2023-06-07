import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ScheduleIcon from "@mui/icons-material/Schedule";
import {
    Box,
    Card,
    CardContent,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Rating,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { Assignment } from "interface/Assignment.interface";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { useDateLocale } from "ui/hooks/DateLocale";
import { ResizableCircle } from "ui/ResizableCircle";
import { AssignmentReviewCard } from "./AssignmentReviewCard";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));

const listIconSx = {
    minWidth: "40px",
};

interface AssignmentSummaryStepProps {
    assignment: Assignment;
}

export const AssignmentSummaryStep = (props: AssignmentSummaryStepProps) => {
    const { assignment } = props;
    const { t } = useTranslation();
    const { locale } = useDateLocale();
    const submission = assignment.submission;
    const duration = intervalToDuration({
        start: 0,
        end: submission?.time || 0,
    });
    const interval = formatDuration(duration, { locale });

    const hasTeacherFeedback = submission?.rating || submission?.comment;

    return (
        <Stack spacing={2}>
            <Card elevation={1}>
                <CardContent sx={{ padding: 2 }}>
                    <Grid container direction="column" spacing={1}>
                        <Grid item>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                            >
                                <List dense>
                                    {submission?.submittedDate && (
                                        <ListItem disableGutters>
                                            <Tooltip
                                                title={
                                                    t(
                                                        "submission:submittedOnTooltip"
                                                    )!
                                                }
                                            >
                                                <ListItemIcon sx={listIconSx}>
                                                    <CalendarTodayIcon />
                                                </ListItemIcon>
                                            </Tooltip>
                                            <ListItemText
                                                primary={t(
                                                    "submission:submittedOnDate",
                                                    {
                                                        date: format(
                                                            new Date(
                                                                submission?.submittedDate
                                                            ),
                                                            "PPp",
                                                            { locale }
                                                        ),
                                                    }
                                                )}
                                            />
                                        </ListItem>
                                    )}
                                    {submission?.time && (
                                        <ListItem disableGutters>
                                            <Tooltip
                                                title={
                                                    t(
                                                        "submission:timeSpentTooltip"
                                                    )!
                                                }
                                            >
                                                <ListItemIcon sx={listIconSx}>
                                                    <ScheduleIcon />
                                                </ListItemIcon>
                                            </Tooltip>
                                            <ListItemText
                                                primary={t(
                                                    "submission:timeSpent",
                                                    {
                                                        interval,
                                                    }
                                                )}
                                            />
                                        </ListItem>
                                    )}
                                </List>
                                {submission?.isApproved && (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                        }}
                                    >
                                        <ResizableCircle
                                            text={submission?.grade}
                                        />
                                        <Typography style={{ paddingTop: 8 }}>
                                            {t("submission:totalScore")}:{" "}
                                            {submission?.score}
                                            {submission?.score <= 100
                                                ? "/100"
                                                : ""}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Grid>
                        {hasTeacherFeedback && (
                            <>
                                <Grid item>
                                    <Divider />
                                </Grid>
                                <Grid item>
                                    <Typography variant="h6" gutterBottom>
                                        {t("assignment:teacherFeedback")}
                                    </Typography>
                                </Grid>
                            </>
                        )}
                        {submission?.rating && (
                            <Grid item display="flex" alignItems="center">
                                <Rating
                                    value={submission?.rating}
                                    max={5}
                                    readOnly
                                />
                                <Box ml={1}>
                                    {t(
                                        `submission:rating_${submission?.rating}`
                                    )}
                                </Box>
                            </Grid>
                        )}
                        {submission?.comment && (
                            <Grid item>
                                {/* Submission comment input */}
                                <Markdown>{submission?.comment}</Markdown>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>
            <AssignmentReviewCard assignment={assignment} readOnly />
        </Stack>
    );
};
