import CourseIcon from "@mui/icons-material/SchoolOutlined";
import {
    Box,
    Button,
    Chip,
    IconButton,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
} from "@mui/material";
import { useAuthContext } from "context/AuthProvider";
import { ellipsis, RoleType } from "core";
import { isAfter } from "date-fns";
import { Course } from "interface/Course.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "ui/route/Navigation";

export function SelectCourseMenu() {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState(null);
    const router = useNavigation();
    const { me } = useAuthContext();

    const activeCourses = (me?.courses || []).filter((c) => !c.archived);
    const archivedCourses = (me?.courses || []).filter((c) => c.archived);
    const courses = activeCourses.concat(...archivedCourses).slice(0, 10);

    const courseIsOpen = (c: Course) =>
        c.startDate ? isAfter(new Date(), new Date(c.startDate)) : true;

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const goToCourses = () => {
        setAnchorEl(null);
        router.push("/");
    };

    const handleSelectCourse = (course: Course) => {
        setAnchorEl(null);
        router.push(`/course/${course.id}`);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const createCourseTitle = (course: Course) => {
        const shortenedTitle = ellipsis(course.title, 40);
        return (
            <>
                {shortenedTitle}
                {course.archived && (
                    <Chip
                        sx={{ marginLeft: 1 }}
                        size="small"
                        label={t("archived")}
                    />
                )}
            </>
        );
    };

    return (
        <>
            <Tooltip title={t("courses")!}>
                <IconButton color="inherit" onClick={handleClick} size="large">
                    <CourseIcon />
                </IconButton>
            </Tooltip>
            <Menu
                id="select-course-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {courses.map((course) => (
                    <MenuItem
                        key={`select_course_${course.id}`}
                        onClick={() => handleSelectCourse(course)}
                        disabled={
                            !courseIsOpen(course) &&
                            course.role === RoleType.courseStudent
                        }
                    >
                        <ListItemText
                            primary={createCourseTitle(course)}
                            color="inherit"
                        />
                    </MenuItem>
                ))}

                <Box sx={{ textAlign: "right", paddingRight: 1 }}>
                    <Button size="small" color="primary" onClick={goToCourses}>
                        {t("showAll")}
                    </Button>
                </Box>
            </Menu>
        </>
    );
}
