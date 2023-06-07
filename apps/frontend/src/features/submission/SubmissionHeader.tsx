import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
    Alert,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Grid,
    Stack,
} from "@mui/material";
import { Submission } from "interface/Submission.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { useNavigation } from "ui/route/Navigation";
import { SubmissionHeaderGradingContainer } from "./SubmissionHeaderGradingContainer";
import { SubmissionHeaderStudentsDropdown } from "./SubmissionHeaderStudentsDropdown";

export interface SubmissionHeaderProps {
    submission?: Submission;
    showGradingActions?: boolean;
    loading?: boolean;
}

export const SubmissionHeader = (props: SubmissionHeaderProps) => {
    const { submission, showGradingActions, loading } = props;
    const { t } = useTranslation();
    const router = useNavigation();

    const assignment = submission?.assignment;
    const submissions = assignment?.submissions || [];

    const [selectedIndex, setSelectedIndex] = useState(
        submissions.findIndex((s) => s.id === submission?.id)
    );

    const handleGoToSubmission = (submissionId: string) => {
        router.push(
            `/${showGradingActions ? "grading" : "submission"}/${submissionId}`
        );
    };

    const routeCleaned = router.asPath.split(/\?|\#/)[0];
    const routeLast = routeCleaned.split("/").slice(-1)[0];

    const handleClickPrevious = () => {
        if (selectedIndex > 0) {
            if (router.asPath.includes("questions")) {
                router.push(
                    `/${showGradingActions ? "grading" : "submission"}/${
                        submissions[selectedIndex - 1]?.id
                    }/questions/${routeLast}`
                );
            } else {
                router.push(
                    `/${showGradingActions ? "grading" : "submission"}/${
                        submissions[selectedIndex - 1]?.id
                    }`
                );
            }
            setSelectedIndex(selectedIndex - 1);
        }
    };
    const handleClickNext = () => {
        if (selectedIndex < submissions.length - 1) {
            if (router.asPath.includes("questions")) {
                router.push(
                    `/${showGradingActions ? "grading" : "submission"}/${
                        submissions[selectedIndex + 1]?.id
                    }/questions/${routeLast}`
                );
            } else {
                router.push(
                    `/${showGradingActions ? "grading" : "submission"}/${
                        submissions[selectedIndex + 1]?.id
                    }`
                );
            }
            setSelectedIndex(selectedIndex + 1);
        }
    };

    return (
        <Grid container direction="row" spacing={1}>
            <Grid item xs={12}>
                <Card
                    sx={{
                        position: "relative",
                        borderRadius: (theme) =>
                            `${theme.shape.borderRadius}px`,
                    }}
                >
                    <CardContent sx={{ paddingTop: 1, paddingBottom: 0 }}>
                        <Stack
                            direction="row"
                            spacing={2}
                            justifyContent="space-between"
                            alignItems="flex-start"
                        >
                            <SubmissionHeaderStudentsDropdown
                                submission={submission}
                                selectedIndex={selectedIndex}
                                setSelectedIndex={setSelectedIndex}
                                handleGoToSubmission={handleGoToSubmission}
                            />
                            <SubmissionHeaderGradingContainer
                                submission={submission}
                                showGradingActions={showGradingActions}
                            />
                        </Stack>
                    </CardContent>
                    <CardActions>
                        <Align left>
                            <Button
                                startIcon={<ChevronLeftIcon />}
                                onClick={handleClickPrevious}
                                disabled={
                                    submissions.length
                                        ? selectedIndex === 0
                                        : true || loading
                                }
                            >
                                {t("submission:previous")}
                            </Button>
                        </Align>
                        <Align right>
                            <Button
                                endIcon={<ChevronRightIcon />}
                                onClick={handleClickNext}
                                disabled={
                                    submissions.length
                                        ? selectedIndex ===
                                          submissions.length - 1
                                        : true || loading
                                }
                            >
                                {t("submission:next")}
                            </Button>
                        </Align>
                    </CardActions>
                    <Box
                        sx={{
                            position: "absolute",
                            width: "6px",
                            height: "100%",
                            top: 0,
                            left: 0,
                            backgroundColor: "secondary.main",
                        }}
                    />
                </Card>
            </Grid>

            {submission?.isTeacherTest && (
                <Grid item xs={12}>
                    <Alert severity="info">
                        {t("submission:testSubmissionAlert")}
                    </Alert>
                </Grid>
            )}
        </Grid>
    );
};
