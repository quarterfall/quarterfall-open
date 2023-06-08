import { Card, CardHeader, Grid, Skeleton, Stack } from "@mui/material";
import { AnalyticsType, Permission } from "core";
import { add, isAfter } from "date-fns";
import { usePermission } from "hooks/usePermission";
import { Course } from "interface/Course.interface";
import { useTranslation } from "react-i18next";
import { PageHeading } from "ui/PageHeading";
import { useNavigation } from "ui/route/Navigation";
import { useParams } from "ui/route/Params";
import { CourseAnalyticsListEditor } from "../analytics/CourseAnalyticsListEditor";
import { CourseStaffLayout } from "../layout/CourseStaffLayout";
import { useCourseAnalytics } from "./api/CourseAnalytics.data";
import { useCourseEvents } from "./api/CourseEvents.data";
import { useCourseInfo } from "./api/CourseInfo.data";
import { CourseRecentActivityCard } from "./CourseRecentActivityCard";
import { CourseStaffInfoContainer } from "./CourseStaffInfoContainer";

export interface CourseStaffDashboardProps {
    course: Course;
    loading?: boolean;
}

export function CourseStaffDashboard(props: CourseStaffDashboardProps) {
    const { t } = useTranslation();
    const { course, loading } = props;
    const { id } = useParams<{ id: string }>();

    const { data: courseInfo, loading: courseInfoLoading } = useCourseInfo(id);

    const { data: courseEvents, loading: courseEventsLoading } =
        useCourseEvents(id);

    const { data: courseAnalytics, loading: courseAnalyticsLoading } =
        useCourseAnalytics(id);

    const can = usePermission();
    const router = useNavigation();
    const handleEditBlock = (blockId: string) => {
        router.push(`/course/${course.id}/analytics/${blockId}`);
    };

    const canViewCourseAnalytics =
        can(Permission.viewAnalytics, course) &&
        course?.startDate &&
        isAfter(new Date(), add(new Date(course.startDate), { days: 1 }));

    return (
        <CourseStaffLayout selected="dashboard">
            <Stack spacing={2}>
                <PageHeading title={course?.title} loading={loading} />
                <CourseStaffInfoContainer
                    course={courseInfo?.course}
                    loading={courseInfoLoading}
                />
                <CourseRecentActivityCard
                    course={courseEvents?.course}
                    loading={courseEventsLoading}
                />
                {canViewCourseAnalytics &&
                    (courseAnalyticsLoading ? (
                        <Grid
                            container
                            direction="column"
                            spacing={1}
                            width="100%"
                        >
                            {course?.analyticsBlocks.map((block) => {
                                if (block?.type === AnalyticsType.course) {
                                    return (
                                        <Grid
                                            key={block?.id}
                                            xs={12}
                                            lg={block?.fullWidth ? 12 : 6}
                                            item
                                        >
                                            <Card>
                                                <CardHeader
                                                    title={t(block?.title)}
                                                />
                                                <Skeleton
                                                    variant="rectangular"
                                                    width="100%"
                                                    height={200}
                                                />
                                            </Card>
                                        </Grid>
                                    );
                                }
                            })}
                        </Grid>
                    ) : (
                        <CourseAnalyticsListEditor
                            course={courseAnalytics?.course}
                            type={AnalyticsType.course}
                            handleEditBlock={handleEditBlock}
                        />
                    ))}
            </Stack>
        </CourseStaffLayout>
    );
}
