import SubmissionIcon from "@mui/icons-material/Book";
import ForwardIcon from "@mui/icons-material/Forward";
import SearchIcon from "@mui/icons-material/Search";
import {
    Alert,
    Button,
    CardActions,
    CardContent,
    CardHeader,
    Chip,
    Grid,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { AssignmentIcon } from "components/icons";
import { format } from "date-fns";
import { Assignment } from "interface/Assignment.interface";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { ClickableCard } from "ui/ClickableCard";
import { DifficultyRating } from "ui/DifficultyRating";
import { useDateLocale } from "ui/hooks/DateLocale";
import { useNavigation } from "ui/route/Navigation";
import { Sticker } from "ui/Sticker";

export interface AssignmentStudentCardProps {
    assignment: Assignment;
    readOnly?: boolean;
}

export function AssignmentStudentCard(props: AssignmentStudentCardProps) {
    const { assignment, readOnly } = props;
    const { t } = useTranslation();

    const router = useNavigation();
    const { locale } = useDateLocale();

    const handleClickToAssignment = () => {
        router.push(`/student/assignment/${assignment.id}`);
    };

    const assignmentTooltipTitle = (() => {
        if (assignment.isStudyMaterial) {
            return assignment.isOptional
                ? t("assignment:optionalStudyMaterial")
                : t("assignment:mandatoryStudyMaterial");
        } else {
            return assignment.isOptional
                ? t("assignment:optionalAssignment")
                : t("assignment:mandatoryAssignment");
        }
    })();

    const assignmentButtonText = (() => {
        if (assignment.isStudyMaterial) {
            return t("assignment:readMaterial");
        } else if (assignment.completed) {
            return t("submission:view");
        } else if (readOnly) {
            return t("assignment:view");
        } else {
            return t("assignment:doAssignment");
        }
    })();

    const assignmentButtonIcon = (() => {
        if (assignment.isStudyMaterial) {
            return <SearchIcon />;
        } else if (assignment.completed) {
            return <SubmissionIcon />;
        } else if (readOnly) {
            return <SearchIcon />;
        } else {
            return <ForwardIcon />;
        }
    })();

    // compute the sticker rotation from the last digits of the id
    const nrRotation = parseInt(assignment.id.slice(-2), 16);
    const rotation = Math.round((nrRotation - 128) / 8);
    const nrPosition = parseInt(assignment.id.slice(-4, -2), 16);
    const positionOffset = Math.round(nrPosition / 4);

    return (
        <ClickableCard
            sx={{
                maxWidth: "800px",
                position: "relative",
            }}
            onClick={handleClickToAssignment}
        >
            <CardHeader
                sx={{ paddingBottom: 1 }}
                title={assignment?.title}
                subheader={
                    assignment?.hasGrading && (
                        <Chip
                            label={t("assignment:hasGrading")}
                            variant="outlined"
                            sx={{
                                fontSize: (theme) => theme.spacing(1.5),
                                height: (theme) => theme.spacing(2.5),
                                paddingRight: 0,
                                paddingLeft: 0,
                                marginLeft: 0,
                                "& .MuiChip-label": {
                                    paddingRight: 1,
                                    paddingLeft: 1,
                                },
                                "& .MuiChip-avatar": {
                                    width: (theme) => theme.spacing(2),
                                    height: (theme) => theme.spacing(2),
                                },
                            }}
                        />
                    )
                }
                avatar={
                    <Tooltip title={assignmentTooltipTitle}>
                        <div>
                            <AssignmentIcon
                                assignment={assignment}
                                color="secondary"
                                fontSize="large"
                            />
                        </div>
                    </Tooltip>
                }
                action={
                    <DifficultyRating
                        difficulty={assignment.difficulty}
                        sx={{ paddingTop: 2 }}
                    />
                }
            />

            <CardContent sx={{ paddingTop: 0, paddingBottom: 0 }}>
                <Grid container direction="column" spacing={1}>
                    {assignment.submission?.submittedDate && (
                        <Grid item>
                            <Alert severity="success" variant="standard">
                                <Stack spacing={1}>
                                    <Typography variant="body2">
                                        {t(
                                            assignment.isStudyMaterial
                                                ? "assignment:readOn"
                                                : "assignment:completedOn",
                                            {
                                                date: format(
                                                    new Date(
                                                        assignment.submission?.submittedDate
                                                    ),
                                                    "PPp",
                                                    { locale }
                                                ),
                                            }
                                        )}
                                    </Typography>

                                    {assignment.submission?.isApproved && (
                                        <div>
                                            <Typography variant="body2">
                                                {t("grade")}:{" "}
                                                {assignment.submission?.grade}
                                            </Typography>
                                            <Typography variant="body2">
                                                {t("submission:totalScore")}:{" "}
                                                {assignment.submission?.score}{" "}
                                                {assignment.submission?.score <=
                                                100
                                                    ? "/100"
                                                    : ""}
                                            </Typography>
                                        </div>
                                    )}
                                </Stack>
                            </Alert>
                        </Grid>
                    )}

                    {assignment.submission?.comment && (
                        <Grid item>
                            <Alert severity="info">
                                {t("assignment:commentByTeacherAlert")}
                            </Alert>
                        </Grid>
                    )}
                </Grid>
            </CardContent>

            <CardActions>
                <Align right>
                    <Button
                        startIcon={assignmentButtonIcon}
                        onClick={handleClickToAssignment}
                    >
                        {assignmentButtonText}
                    </Button>
                </Align>
            </CardActions>
            {assignment.submission?.sticker && (
                <Tooltip
                    title={
                        t(
                            `submission:tooltipSticker_${assignment.submission?.sticker}`
                        )!
                    }
                >
                    <Box
                        sx={{
                            top: 0,
                            position: "absolute",
                            right: 100 + positionOffset,
                        }}
                    >
                        <Sticker
                            type={assignment.submission?.sticker}
                            sx={{
                                width: "100px",
                                filter: "drop-shadow(3px 3px 5px #333333)",
                                transform: `rotate(${rotation}deg)`,
                            }}
                        />
                    </Box>
                </Tooltip>
            )}
        </ClickableCard>
    );
}
