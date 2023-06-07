import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChromeReaderModeIcon from "@mui/icons-material/ChromeReaderMode";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import { Box, Grid } from "@mui/material";
import color from "color";
import { colors } from "config";
import { format } from "date-fns";
import { Course } from "interface/Course.interface";
import { useTranslation } from "react-i18next";
import { ChartDashboardCard } from "ui/dashboard/ChartDashboardCard";
import { SimpleDashboardCard } from "ui/dashboard/SimpleDashboardCard";
import { useNavigation } from "ui/route/Navigation";

interface CourseStaffInfoContainerProps {
    course: Course;
    loading: boolean;
}

export const CourseStaffInfoContainer = (
    props: CourseStaffInfoContainerProps
) => {
    const { course, loading } = props;
    const { t } = useTranslation();
    const router = useNavigation();

    // colors
    const enrolledColor = color(colors.primary).darken(0.5);
    const enrolledColorHover = enrolledColor.lighten(0.1);
    const invitedColor = color(colors.primary).lighten(0.5);
    const invitedColorHover = invitedColor.darken(0.1);

    // Enrolled students / Total students
    const totalStudents = course?.students.length || 0;
    const enrolledStudents =
        course?.students.filter((c) => c.isActive).length || 0;
    const invitedStudents = totalStudents - enrolledStudents;

    // Active team members / Total team members
    const totalMembers = course?.staff.length || 0;
    const activeMembers = course?.staff.filter((c) => c.isActive).length || 0;
    const invitedMembers = totalMembers - activeMembers;

    // Assignment count
    const modules = course?.modules;
    const assignments = modules?.flatMap((m) => m?.assignments);

    const handleClickUpdateCourseDateTime = () => {
        router.push(`/course/${course.id}/settings`);
    };
    const handleClickInviteStudents = () => {
        router.push(`/course/${course.id}/students`);
    };
    const handleClickAddTeamMember = () => {
        router.push(`/course/${course.id}/team`);
    };
    const handleClickAddAssignment = () => {
        router.push(`/course/${course.id}/content`);
    };

    const simpleDashboardCards = [
        {
            title: t("startDateTime"),
            description: course?.startDate
                ? format(new Date(course?.startDate), "PP")
                : t("course:noStartDate"),
            secondaryDescription:
                course?.startDate && format(new Date(course?.startDate), "p"),
            tooltipTitle: t("course:startDateDashboardTooltip"),

            icon: <CalendarTodayIcon />,
            onClick: handleClickUpdateCourseDateTime,
        },
        {
            title: t("endDateTime"),
            description: course?.endDate
                ? format(new Date(course?.endDate), "PP")
                : t("course:noEndDate"),
            secondaryDescription:
                course?.endDate && format(new Date(course?.endDate), "p"),
            tooltipTitle: t("course:endDateDashboardTooltip"),
            icon: <EventIcon />,
            onClick: handleClickUpdateCourseDateTime,
        },
        {
            title: t("assignments"),
            description: assignments?.length.toString(),
            tooltipTitle: !!assignments?.length
                ? t("course:assignmentsDashboardTooltip")
                : t("course:noAssignmentsDashboardTooltip"),

            icon: <ChromeReaderModeIcon />,
            onClick: handleClickAddAssignment,
        },
    ];

    const chartDashboardCards = [
        {
            title: t("students"),
            data: {
                labels: [t("invited"), t("enrolled")],
                datasets: [
                    {
                        label: t("students"),
                        data: [invitedStudents, enrolledStudents],
                        backgroundColor: [
                            invitedColor.string(),
                            enrolledColor.string(),
                        ],
                        hoverBackgroundColor: [
                            invitedColorHover.string(),
                            enrolledColorHover.string(),
                        ],
                    },
                ],
            },
            icon: <AssignmentIndIcon />,
            tooltipTitle: totalStudents
                ? t("course:inviteStudentsDashboardTooltip")
                : t("course:noInvitedStudentsDashboardTooltip"),
            onClick: handleClickInviteStudents,
        },
        {
            title: t("course:teamMembers"),
            data: {
                datasets: [
                    {
                        label: t("course:teamMembers"),
                        data: [invitedMembers, activeMembers],
                        backgroundColor: [
                            invitedColor.string(),
                            enrolledColor.string(),
                        ],
                        hoverBackgroundColor: [
                            invitedColorHover.string(),
                            enrolledColorHover.string(),
                        ],
                    },
                ],
                labels: [t("invited"), t("active")],
            },
            icon: <PeopleIcon />,
            tooltipTitle: !!totalMembers
                ? t("course:inviteTeamMembersDashboardTooltip")
                : t("course:noInvitedMembersDashboardTooltip"),
            onClick: handleClickAddTeamMember,
        },
    ];

    return (
        <Box>
            <Grid container direction="row" spacing={2} alignItems="stretch">
                {simpleDashboardCards.map((c, index) => {
                    return (
                        <Grid item xs={12} lg={4} key={index}>
                            <SimpleDashboardCard
                                title={c.title}
                                description={c.description}
                                secondaryDescription={c.secondaryDescription}
                                tooltipTitle={c.tooltipTitle}
                                icon={c.icon}
                                onClick={c.onClick}
                                loading={loading}
                            />
                        </Grid>
                    );
                })}
                {chartDashboardCards.map((c, index) => {
                    return (
                        <Grid item xs={12} lg={6} key={index}>
                            <ChartDashboardCard
                                title={c.title}
                                icon={c.icon}
                                data={c.data}
                                tooltipTitle={c.tooltipTitle}
                                onClick={c.onClick}
                                loading={loading}
                            />
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};
