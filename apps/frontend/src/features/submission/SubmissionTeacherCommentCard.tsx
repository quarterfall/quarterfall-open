import { Card, CardContent, CardHeader, Grid } from "@mui/material";
import { Permission } from "core";
import { assignmentIsOpen } from "features/assignment/utils/AssignmentUtils";
import { usePermission } from "hooks/usePermission";
import { Submission } from "interface/Submission.interface";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";

import { useToast } from "hooks/useToast";
import { LabeledRatingController } from "ui/form/RatingFieldController";
import { StickerPickerFieldController } from "ui/form/StickerPickerFieldController";
import { useParams } from "ui/route/Params";
import { useUpdateSubmission } from "./Submission.data";

const MarkdownFieldController = dynamic(() =>
    import("ui/form/MarkdownFieldController").then(
        (mod) => mod.MarkdownFieldController
    )
);

export interface SubmissionTeacherCommentCardProps {
    submission: Submission;
    loading?: boolean;
}

export function SubmissionTeacherCommentCard(
    props: SubmissionTeacherCommentCardProps
) {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const { submission } = props;
    const { showSuccessToast } = useToast();
    const [updateSubmissionMutation] = useUpdateSubmission();
    const can = usePermission();

    const assignment = submission?.assignment;
    const module = assignment?.module;
    const course = module?.course;

    const open = assignmentIsOpen(assignment);

    const canUpdateSubmission =
        can(Permission.updateSubmission, course) && open && !course.archived;

    // Form for the submission comments
    const { control } = useAutosaveForm({
        onSave: async (input) => {
            await updateSubmissionMutation({
                variables: {
                    id,
                    input,
                },
            });
            showSuccessToast();
        },
        defaultValues: { ...submission },
    });

    return (
        <form>
            <Card sx={{ width: "100%" }}>
                <CardHeader
                    title={t("submission:teacherComment")}
                    subheader={t("submission:commentBody")}
                />
                <CardContent>
                    <Grid container direction="column" spacing={2}>
                        <Grid item>
                            <LabeledRatingController
                                ratingLabelPlacement="end"
                                ratingLabel={(rating) =>
                                    t(`submission:rating_${rating}`)
                                }
                                name="rating"
                                control={control}
                                disabled={!canUpdateSubmission}
                            />
                        </Grid>
                        <Grid item>
                            {/* Submission comment input */}
                            <MarkdownFieldController
                                fullWidth
                                multiline
                                minRows={3}
                                maxRows={Infinity}
                                label={t("submission:commentLabel")}
                                name="comment"
                                control={control}
                                disabled={!canUpdateSubmission}
                            />
                        </Grid>
                        <Grid item>
                            <StickerPickerFieldController
                                name="sticker"
                                control={control}
                                disabled={!canUpdateSubmission}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </form>
    );
}
