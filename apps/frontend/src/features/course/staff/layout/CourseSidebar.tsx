import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ContentIcon from "@mui/icons-material/ChromeReaderMode";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import {
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
} from "@mui/material";
import { Permission } from "core";

import { usePermission } from "hooks/usePermission";
import { Course } from "interface/Course.interface";
import { useTranslation } from "react-i18next";
import { useNavigation } from "ui/route/Navigation";
import { CourseSidebarHeader } from "./CourseSidebarHeader";

export type CourseSidebarItem =
    | "dashboard"
    | "content"
    | "analytics"
    | "submissions"
    | "grading"
    | "team"
    | "settings"
    | "students";

export interface CourseSidebarProps {
    course: Course;
    loading?: boolean;
    selected?: CourseSidebarItem;
}

export function CourseSidebar(props: CourseSidebarProps) {
    const { course, loading, selected } = props;

    const { t } = useTranslation();
    const router = useNavigation();
    const can = usePermission();

    const handleClickBack = () => {
        if (course?.library) {
            router.push("/admin/library");
        } else {
            router.push("/");
        }
    };

    return (
        <>
            <CourseSidebarHeader course={course} loading={loading} />
            <List style={{ padding: 0 }}>
                <ListItem button onClick={handleClickBack}>
                    <ListItemIcon>
                        <ChevronLeftIcon />
                    </ListItemIcon>
                    <ListItemText
                        disableTypography
                        primary={
                            <Typography variant="button">
                                {course?.library ? t("library") : t("home")}
                            </Typography>
                        }
                    />
                </ListItem>
                <Divider />

                <ListItem
                    button
                    selected={selected === "dashboard"}
                    onClick={() => router.push(`/course/${course?.id}`)}
                    data-cy="courseSidebarHomeTab"
                >
                    <ListItemIcon>
                        <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("dashboard")} />
                </ListItem>

                <ListItem
                    button
                    selected={selected === "content"}
                    onClick={() => router.push(`/course/${course?.id}/content`)}
                    data-cy="courseSidebarContentTab"
                >
                    <ListItemIcon>
                        <ContentIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("content")} />
                </ListItem>
                {!course?.library && can(Permission.readCourseUser, course) && (
                    <ListItem
                        button
                        onClick={() =>
                            router.push(`/course/${course?.id}/team`)
                        }
                        selected={selected === "team"}
                        data-cy="courseSidebarTeamTab"
                    >
                        <ListItemIcon>
                            <PeopleIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("team")} />
                    </ListItem>
                )}
                {!course?.library && can(Permission.readCourseUser, course) && (
                    <ListItem
                        button
                        onClick={() =>
                            router.push(`/course/${course?.id}/students`)
                        }
                        selected={selected === "students"}
                        data-cy="courseSidebarStudentTab"
                    >
                        <ListItemIcon>
                            <AssignmentIndIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("students")} />
                    </ListItem>
                )}

                {can(Permission.readCourse, course) && (
                    <ListItem
                        button
                        selected={selected === "settings"}
                        onClick={() =>
                            router.push(`/course/${course?.id}/settings`)
                        }
                        data-cy="courseSidebarSettingsTab"
                    >
                        <ListItemIcon>
                            <SettingsIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("settings")} />
                    </ListItem>
                )}
            </List>
        </>
    );
}
