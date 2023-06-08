import { Skeleton, Stack } from "@mui/material";

export const CourseSidebarSkeleton = () => {
    return (
        <Stack spacing={1} height={"100%"} sx={{ paddingY: 1 }}>
            <Skeleton
                variant="rectangular"
                width={235}
                height={135}
                sx={{
                    borderRadius: (theme) => `${theme.shape.borderRadius}px `,
                }}
            />
            <Skeleton
                variant="rectangular"
                width={235}
                height={"100%"}
                sx={{
                    borderRadius: (theme) => `${theme.shape.borderRadius}px `,
                }}
            />
        </Stack>
    );
};
