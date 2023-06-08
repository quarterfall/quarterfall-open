import { Grid } from "@mui/material";
import { SubmissionLayout } from "features/submission/layout/SubmissionLayout";
import { SubmissionHeader } from "features/submission/SubmissionHeader";
import { SubmissionInfoCard } from "features/submission/SubmissionInfoCard";
import SubmissionReviewCard from "features/submission/SubmissionReviewCard";
import { SubmissionTeacherCommentCard } from "features/submission/SubmissionTeacherCommentCard";
import { Submission } from "interface/Submission.interface";

type GradingPageProps = {
    submission: Submission;
};

export const GradingPage = (props: GradingPageProps) => {
    const { submission } = props;
    const assignment = submission?.assignment;
    const module = assignment?.module;
    const course = module?.course;

    return (
        <SubmissionLayout
            submission={submission}
            selected={"overview"}
            showGradingActions
        >
            <Grid container spacing={1} direction="column">
                <Grid item xs={12} style={{ width: "100%" }}>
                    <SubmissionHeader
                        submission={submission}
                        showGradingActions={!course?.archived}
                    />
                </Grid>
                <Grid item>
                    <SubmissionInfoCard submission={submission} />
                </Grid>
                <Grid item>
                    <SubmissionReviewCard submission={submission} />
                </Grid>
                <Grid item>
                    <SubmissionTeacherCommentCard submission={submission} />
                </Grid>
            </Grid>
        </SubmissionLayout>
    );
};
