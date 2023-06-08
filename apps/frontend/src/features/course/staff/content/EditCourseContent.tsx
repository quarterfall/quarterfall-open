import { Alert, Box, Card, Skeleton, Stack } from "@mui/material";
import { CourseStaffLayout } from "features/course/staff/layout/CourseStaffLayout";
import { Course } from "interface/Course.interface";
import { useTranslation } from "react-i18next";
import { PageHeading } from "ui/PageHeading";
import { useParams } from "ui/route/Params";
import { useCourseModules } from "./api/CourseModules.data";
import EditCourseModules from "./EditCourseModules";

export interface CourseContentProps {
    course: Course;
    loading?: boolean;
}

export function CourseContent(props: CourseContentProps) {
    const { course } = props;
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();

    const { data: courseModules, loading: courseModulesLoading } =
        useCourseModules(id);

    return (
        <CourseStaffLayout noScrolling noMainPadding selected="content">
            <Box
                sx={(theme) => ({
                    flexGrow: 1,
                    display: "flex",
                    flexWrap: "nowrap",
                    flexDirection: "column",
                    minHeight: 0,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231c9eff' fill-opacity='0.06'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                })}
            >
                <Box sx={{ margin: 1, marginBottom: 0 }}>
                    <PageHeading title={t("content")} />
                </Box>

                {course?.archived && (
                    <Alert sx={{ margin: 1 }} severity="info">
                        {t("course:archivedMessageStaff")}
                    </Alert>
                )}
                {!courseModules || courseModulesLoading ? (
                    <Stack direction="row" spacing={1} px={1} pt={1}>
                        {Array.from(Array(10).keys()).map((m, index) => (
                            <Card
                                key={index}
                                sx={{
                                    minWidth: 300,
                                    height: 500,
                                }}
                            >
                                <Skeleton
                                    variant="rectangular"
                                    width="300px"
                                    height="100%"
                                />
                            </Card>
                        ))}
                    </Stack>
                ) : (
                    <EditCourseModules
                        course={courseModules?.course}
                        loading={courseModulesLoading}
                    />
                )}
            </Box>
        </CourseStaffLayout>
    );
}
