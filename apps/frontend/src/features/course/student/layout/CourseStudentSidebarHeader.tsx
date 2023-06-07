import StorefrontIcon from "@mui/icons-material/Storefront";
import { Skeleton, Tooltip, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { defaultCourseImage, ellipsis } from "core";
import { Course } from "interface/Course.interface";
import { useMemo } from "react";

export interface CourseStudentSidebarHeaderProps {
    course: Course;
    loading?: boolean;
}
export function CourseStudentSidebarHeader(
    props: CourseStudentSidebarHeaderProps
) {
    const { course, loading } = props;

    const courseImageUrl = useMemo(() => {
        if (course?.selectedImage === "custom" && course?.image) {
            return course?.image;
        } else {
            return `/course-images/${
                course?.selectedImage || defaultCourseImage
            }.jpg`;
        }
    }, [course]);

    return loading ? (
        <Skeleton variant="rectangular" width={239} height={135} />
    ) : (
        <Box
            sx={{
                backgroundImage: `linear-gradient(transparent, rgba(0, 0, 0, 0.6)),url(${courseImageUrl}) `,
                backgroundSize: "cover",
                width: 239,
                height: 135,
                position: "relative",
                ...(course?.archived && { filter: "grayscale(100%)" }),
            }}
        >
            {course?.library && (
                <Box
                    sx={{
                        position: "absolute",
                        width: "100%",
                        top: 0,
                        color: "white",
                        padding: (theme) => theme.spacing(1),
                    }}
                >
                    <StorefrontIcon />
                </Box>
            )}
            <Box
                sx={{
                    position: "absolute",
                    width: "100%",
                    bottom: 0,
                    color: "white",
                    padding: (theme) => theme.spacing(1),
                }}
            >
                <Tooltip
                    disableHoverListener={course?.title?.length < 20}
                    title={course?.title}
                >
                    <Typography variant="h6" sx={{ wordBreak: "break-word" }}>
                        {ellipsis(course?.title || "", 40)}
                    </Typography>
                </Tooltip>
            </Box>
        </Box>
    );
}
