import { Card, CardContent, CardHeader, Grid } from "@mui/material";
import { Submission } from "interface/Submission.interface";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { LabeledRating } from "ui/form/inputs/LabeledRating";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));

export interface SubmissionReviewCardProps {
    submission: Submission;
    loading?: boolean;
}
export default function SubmissionReviewCard(props: SubmissionReviewCardProps) {
    const { submission } = props;
    const { t } = useTranslation();
    return (
        <Card>
            <CardHeader title={t("assignment:studentFeedback")} />
            <CardContent sx={{ paddingTop: 0 }}>
                <Grid container direction="column" spacing={2}>
                    {/* Difficulty */}
                    <Grid item xs={12}>
                        <LabeledRating
                            readOnly
                            legend={t("assignment:averageDifficulty")}
                            ratingLabel={(rating) =>
                                t(`assignment:difficultyRating_${rating}`)
                            }
                            value={submission.studentRatingDifficulty}
                        />
                    </Grid>
                    {/* Usefulness */}
                    <Grid item xs={12}>
                        <LabeledRating
                            readOnly
                            legend={t("assignment:usefulness")}
                            ratingLabel={(rating) =>
                                t(`assignment:usefulnessRating_${rating}`)
                            }
                            value={submission.studentRatingUsefulness}
                        />
                    </Grid>

                    {/* Comment */}
                    {submission.studentComment && (
                        <Grid item xs={12}>
                            <Markdown>{submission.studentComment}</Markdown>
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
}
