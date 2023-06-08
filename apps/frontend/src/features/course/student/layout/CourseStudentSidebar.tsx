import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import {
    Box,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
} from "@mui/material";
import { CourseSidebarSkeleton } from "features/course/staff/layout/CourseSidebarSkeleton";
import { Course } from "interface/Course.interface";
import { useTranslation } from "react-i18next";
import { useNavigation } from "ui/route/Navigation";
import { CourseStudentModuleList } from "./CourseStudentModuleList";
import { CourseStudentSidebarHeader } from "./CourseStudentSidebarHeader";

export type CourseStudentSidebarItem =
    | "dashboard"
    | "modules"
    | "assignments"
    | "submissions"
    | "grading"
    | "team"
    | "settings"
    | "students";

export interface CourseStudentSidebarProps {
    course: Course;
    loading?: boolean;
    selected?: CourseStudentSidebarItem;
}

export function CourseStudentSidebar(props: CourseStudentSidebarProps) {
    const { course, loading, selected } = props;

    const { t } = useTranslation();
    const router = useNavigation();

    const modules = course?.modules || [];

    const handleClickBack = () => {
        router.push("/");
    };

    if (loading && !course) {
        return <CourseSidebarSkeleton />;
    }

    return (
        <Box component="nav">
            <CourseStudentSidebarHeader course={course} loading={loading} />
            <List style={{ padding: 0 }}>
                <ListItemButton onClick={handleClickBack}>
                    <ListItemIcon>
                        <ChevronLeftIcon />
                    </ListItemIcon>
                    <ListItemText
                        disableTypography
                        primary={
                            <Typography variant="button">
                                {t("home")}
                            </Typography>
                        }
                    />
                </ListItemButton>
                <Divider />
                <ListItemButton
                    selected={selected === "dashboard"}
                    onClick={() => router.push(`/student/course/${course?.id}`)}
                >
                    <ListItemIcon sx={{ marginLeft: 0.1 }}>
                        <DashboardIcon fontSize="medium" />
                    </ListItemIcon>
                    <ListItemText primary={t("course:overview")} />
                </ListItemButton>

                {modules.map((module) => {
                    return (
                        <CourseStudentModuleList
                            key={module?.id}
                            module={module}
                        />
                    );
                })}
            </List>
        </Box>
    );
}
