import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ProgressIcon from "@mui/icons-material/ShowChart";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import {
    Box,
    CardContent,
    CardHeader,
    CardMedia,
    Chip,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Typography,
} from "@mui/material";
import { defaultCourseImage, ellipsis, Permission, RoleType } from "core";
import { format, isBefore } from "date-fns";
import { usePermission } from "hooks/usePermission";
import { Course } from "interface/Course.interface";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ClickableCard } from "ui/ClickableCard";
import { useDateLocale } from "ui/hooks/DateLocale";
import { useNavigation } from "ui/route/Navigation";
import { CourseActionMenu } from "./CourseActionMenu";

export interface CourseCardProps {
    course: Course;
    hideRole?: boolean;
    onRefresh?: () => void;
}

export function CourseCard(props: CourseCardProps) {
    const { course, onRefresh } = props;
    const { locale } = useDateLocale();

    const courseImageUrl = useMemo(() => {
        if (course?.selectedImage === "custom" && course?.image) {
            return course?.image;
        } else {
            return `/course-images/${
                course?.selectedImage || defaultCourseImage
            }.jpg`;
        }
    }, [course]);

    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState(null);
    const router = useNavigation();
    const can = usePermission();

    const willOpen = course?.startDate
        ? isBefore(new Date(), new Date(course?.startDate))
        : false;
    const modules = (course?.modules || []).filter((m) => !m?.isOptional);
    const completedModules = modules.filter((m) => m.completed);
    const hasStaffRole = course.role && course.role !== RoleType.courseStudent;

    const handleClickView = () => {
        // make sure we only handle the click if you actually click on the card instead of the menu
        if (anchorEl) {
            return;
        }
        // don't show a course that still will open
        if (willOpen && !hasStaffRole) {
            return;
        }
        router.push(`${hasStaffRole ? "" : "/student"}/course/${course.id}`);
    };

    const handleClickMenu = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const showActionMenu =
        can(Permission.createCourse) || can(Permission.updateCourse, course);

    return (
        <ClickableCard
            sx={{
                ...(course.archived && { filter: "grayscale(100%)" }),
                ...(willOpen && !hasStaffRole && { cursor: "default" }),
            }}
            onClick={handleClickView}
            disabled={willOpen && !hasStaffRole}
            data-cy={`courseCard_${course.title}`}
        >
            <CardHeader
                sx={{
                    height: (theme) => theme.spacing(13),
                    alignItems: "flex-start",
                }}
                title={
                    <Typography variant="h5">
                        {ellipsis(course?.title, 45)}
                    </Typography>
                }
                subheader={
                    course?.code &&
                    !course?.demo &&
                    !course?.archived && (
                        <Typography variant="body2" color="textSecondary">
                            {course?.code}
                        </Typography>
                    )
                }
                action={
                    showActionMenu && (
                        <IconButton
                            aria-label="course-settings"
                            onClick={handleClickMenu}
                            color="inherit"
                            style={{ zIndex: 2 }}
                            data-cy="courseMenuButton"
                            size="large"
                        >
                            <MoreVertIcon id="course-action-menu-icon" />
                        </IconButton>
                    )
                }
            />
            <CardMedia
                sx={{ height: 200, position: "relative", objectFit: "cover" }}
                image={courseImageUrl}
            >
                <Box
                    sx={{
                        position: "absolute",
                        bottom: (theme) => theme.spacing(1),
                        right: (theme) => theme.spacing(1),
                    }}
                >
                    {course?.archived && (
                        <Chip
                            size="small"
                            color="secondary"
                            label={t("archived")}
                            sx={{ cursor: "pointer" }}
                            data-cy="courseCardArchivedChip"
                        />
                    )}
                    {course?.demo && !course?.archived && (
                        <Tooltip title={t("course:demoTooltip")!}>
                            <Chip
                                size="small"
                                color="secondary"
                                label={t("course:demo")}
                                sx={{ cursor: "pointer" }}
                            />
                        </Tooltip>
                    )}
                </Box>
            </CardMedia>
            <CardContent sx={{ height: (theme) => theme.spacing(13) }}>
                <Grid container justifyContent="space-between">
                    <Grid item>
                        <List dense disablePadding>
                            {!hasStaffRole && !willOpen && (
                                <ListItem disableGutters>
                                    <ListItemIcon sx={{ minWidth: 28 }}>
                                        <ProgressIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={t(
                                            "course:completedModulesCount",
                                            {
                                                count: modules.length,
                                                completed:
                                                    completedModules.length,
                                            }
                                        )}
                                    />
                                </ListItem>
                            )}
                            {can(Permission.readCourseUser, course) &&
                                hasStaffRole && (
                                    <ListItem
                                        disableGutters
                                        sx={
                                            course?.studentCount
                                                ? {}
                                                : {
                                                      color: (theme) =>
                                                          theme.palette.text
                                                              .disabled,
                                                  }
                                        }
                                    >
                                        <ListItemIcon sx={{ minWidth: 28 }}>
                                            <AssignmentIndIcon
                                                fontSize="small"
                                                color={
                                                    course?.studentCount
                                                        ? "inherit"
                                                        : "disabled"
                                                }
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                course?.studentCount
                                                    ? t(
                                                          `course:studentsEnrolled`,
                                                          {
                                                              count: course?.studentCount,
                                                          }
                                                      )
                                                    : t(
                                                          `course:noStudentsEnrolled`
                                                      )
                                            }
                                        />
                                    </ListItem>
                                )}
                            {hasStaffRole && course.role && (
                                <ListItem disableGutters>
                                    <ListItemIcon sx={{ minWidth: 28 }}>
                                        <VerifiedUserIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={t(`roles:${course?.role}`)}
                                    />
                                </ListItem>
                            )}
                        </List>
                    </Grid>
                    <Grid item>
                        <List dense disablePadding>
                            {course?.startDate && (
                                <ListItem disableGutters>
                                    <ListItemText
                                        primary={t("startDate", {
                                            date: format(
                                                new Date(course?.startDate),
                                                "PP",
                                                { locale }
                                            ),
                                        })}
                                        style={{
                                            textAlign: "right",
                                        }}
                                    />
                                </ListItem>
                            )}
                            {course?.endDate && (
                                <ListItem disableGutters>
                                    <ListItemText
                                        primary={t("closeDate", {
                                            date: format(
                                                new Date(course?.endDate),
                                                "PP",
                                                { locale }
                                            ),
                                        })}
                                        style={{
                                            textAlign: "right",
                                        }}
                                    />
                                </ListItem>
                            )}
                        </List>
                    </Grid>
                </Grid>
            </CardContent>
            <CourseActionMenu
                course={course}
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                onRefresh={onRefresh}
            />
        </ClickableCard>
    );
}
