import AssessmentIcon from "@mui/icons-material/Assessment";
import {
    Avatar,
    Box,
    darken,
    lighten,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import { ellipsis } from "core";
import { Submission } from "interface/Submission.interface";

export interface SubmissionSidebarHeaderProps {
    submission: Submission;
}

export const SubmissionSidebarHeader = (
    props: SubmissionSidebarHeaderProps
) => {
    const { submission } = props;

    const titleMaxLength = 20;
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            pt={2}
            pb={1}
            sx={(theme) => ({
                backgroundColor:
                    theme.palette.mode === "light"
                        ? darken(theme.palette.background.paper, 0.08)
                        : lighten(theme.palette.background.paper, 0.08),
            })}
        >
            <Avatar
                sx={{
                    marginBottom: 1,
                    backgroundColor: "secondary.main",
                    color: "secondary.contrastText",
                }}
            >
                <AssessmentIcon />
            </Avatar>
            <Tooltip
                title={
                    submission?.assignment?.title.length > titleMaxLength ? (
                        <Typography>{submission?.assignment?.title}</Typography>
                    ) : (
                        ""
                    )
                }
            >
                <Typography
                    variant="h6"
                    color="textSecondary"
                    sx={{ textAlign: "center" }}
                >
                    {ellipsis(
                        submission?.assignment?.title || "",
                        titleMaxLength
                    )}
                </Typography>
            </Tooltip>

            <Stack direction="row" spacing={0.4}>
                {submission?.student?.firstName && (
                    <Typography variant="body1">
                        {submission.student.firstName}
                    </Typography>
                )}
                {submission?.student?.lastName && (
                    <Typography variant="body1">
                        {submission.student.lastName}
                    </Typography>
                )}
            </Stack>

            {submission?.student?.emailAddress && (
                <Typography
                    variant="caption"
                    color="textSecondary"
                    gutterBottom
                >
                    {submission.student.emailAddress}
                </Typography>
            )}
        </Box>
    );
};
