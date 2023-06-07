import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import EventIcon from "@mui/icons-material/Event";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { format } from "date-fns";
import { Course } from "interface/Course.interface";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { SimpleDashboardCard } from "ui/dashboard/SimpleDashboardCard";
import { ProminentLinearProgress } from "ui/progress/ProminentLinearProgress";
import { CourseDoNextAssignmentButton } from "./CourseDoNextAssignmentButton";

interface CourseStudentInfoProps {
    course: Course;
    loading?: boolean;
}

export const CourseStudentInfo = (props: CourseStudentInfoProps) => {
    const { course, loading } = props;
    const { t } = useTranslation();

    const modules = (course?.modules || []).filter((m) => !m?.isOptional);

    const courseCompletionPercentage = Math.round(
        (modules.filter((m) => m.completed).length / modules.length) * 100
    );

    const simpleDashboardCards = [
        {
            title: t("startDateTime"),
            description: course?.startDate
                ? format(new Date(course?.startDate), "PP")
                : t("course:noStartDate"),
            secondaryDescription:
                course?.startDate && format(new Date(course?.startDate), "p"),
            icon: <CalendarTodayIcon />,
            onClick: () => {},
        },
        {
            title: t("endDateTime"),
            description: course?.endDate
                ? format(new Date(course?.endDate), "PP")
                : t("course:noEndDate"),
            secondaryDescription:
                course?.endDate && format(new Date(course?.endDate), "p"),
            icon: <EventIcon />,
            onClick: () => {},
        },
        {
            title: t("course:progress"),
            description: (
                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mt: 1 }}
                >
                    <Box width="70%">
                        <ProminentLinearProgress
                            variant="determinate"
                            value={courseCompletionPercentage}
                        />
                    </Box>
                    <Typography>{`${courseCompletionPercentage}%`}</Typography>
                </Stack>
            ),
            icon: <DonutLargeIcon />,
            onClick: () => {},
            action: (
                <Align right>
                    <CourseDoNextAssignmentButton
                        course={course}
                        size="small"
                    />
                </Align>
            ),
        },
    ];
    return (
        <Box>
            <Grid container direction="row" spacing={2} alignItems="stretch">
                {simpleDashboardCards.map((c, index) => {
                    return (
                        <Grid item xs={12} lg={4} key={index}>
                            <SimpleDashboardCard
                                title={c?.title}
                                description={c?.description}
                                secondaryDescription={c?.secondaryDescription}
                                icon={c?.icon}
                                onClick={c?.onClick}
                                loading={loading}
                                clickable={false}
                                action={c?.action}
                            />
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};
