import { Grid } from "@mui/material";
import { SubmissionLayout } from "features/submission/layout/SubmissionLayout";
import { SubmissionHeader } from "features/submission/SubmissionHeader";
import { SubmissionInfoCard } from "features/submission/SubmissionInfoCard";
import SubmissionReviewCard from "features/submission/SubmissionReviewCard";
import { SubmissionTeacherCommentCard } from "features/submission/SubmissionTeacherCommentCard";
import { Submission } from "interface/Submission.interface";

interface SubmissionHomePageProps {
    submission?: Submission;
    loading?: boolean;
}

export function SubmissionHomePage(props: SubmissionHomePageProps) {
    const { submission, loading } = props;

    return (
        <SubmissionLayout submission={submission} selected={"overview"}>
            <Grid container spacing={1} direction="column">
                <Grid item xs={12} style={{ width: "100%" }}>
                    <SubmissionHeader
                        submission={submission}
                        loading={loading}
                    />
                </Grid>
                <Grid item>
                    <SubmissionInfoCard
                        submission={submission}
                        loading={loading}
                    />
                </Grid>
                <Grid item>
                    <SubmissionReviewCard
                        submission={submission}
                        loading={loading}
                    />
                </Grid>
                <Grid item>
                    <SubmissionTeacherCommentCard
                        submission={submission}
                        loading={loading}
                    />
                </Grid>
            </Grid>
        </SubmissionLayout>
    );
}
