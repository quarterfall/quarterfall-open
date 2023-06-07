import AssessmentIcon from "@mui/icons-material/Assessment";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Stack,
    Typography,
} from "@mui/material";
import { AssessmentType } from "core";
import { useUpdateTeacherAssessment } from "features/question/staff/Question.data";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { Submission } from "interface/Submission.interface";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { useAutosaveForm } from "ui/form/Autosave";
import { NumberFieldController } from "ui/form/NumberFieldController";
import { SliderController } from "ui/form/SliderController";
import { TextFieldController } from "ui/form/TextFieldController";
export interface SubmissionQuestionScoringCardProps {
    block: Block;
    submission: Submission;
    assignment: Assignment;
}

export const SubmissionQuestionScoringCard = (
    props: SubmissionQuestionScoringCardProps
) => {
    const { t } = useTranslation();
    const { showSuccessToast } = useToast();

    const { block, submission, assignment } = props;
    const [updateTeacherAssessment] = useUpdateTeacherAssessment();

    const defaultValues = {
        score: block?.feedback?.score || 0,
        justificationText: block?.feedback?.justificationText || "",
    };

    const onSave = async (input) => {
        await updateTeacherAssessment({
            variables: {
                blockId: block.id,
                submissionId: submission?.id,
                score: input.score,
                justificationText: input.justificationText,
            },
        });
        showSuccessToast();
    };

    const { control, watch, reset } = useAutosaveForm({
        defaultValues,
        onSave,
    });

    useEffect(() => {
        reset(defaultValues);
    }, [block.id]);

    return (
        <Card sx={{ position: "relative" }}>
            <CardHeader
                avatar={<AssessmentIcon color="secondary" />}
                title={t(`assignment:assessment`)}
                subheader={
                    block.assessmentMethod
                        ? t(
                              `submission:assessmentMethod_${block.assessmentMethod}`
                          )
                        : ""
                }
            />
            <CardContent
                sx={{
                    paddingBottom: 0,
                    paddingTop: 0,
                    paddingLeft: 3,
                }}
            >
                <Stack spacing={1}>
                    {!(
                        submission.assignment.assessmentType ===
                        AssessmentType.teacher
                    ) && (
                        <Typography>
                            {t("assignment:score")}: {block?.feedback?.score}
                        </Typography>
                    )}
                    {submission.assignment.assessmentType ===
                        AssessmentType.teacher &&
                        !submission.isApproved && (
                            <Stack spacing={1}>
                                {block?.criteriaText && (
                                    <Stack>
                                        <Typography
                                            variant="caption"
                                            gutterBottom
                                        >
                                            {t("assignment:criteriaText")}
                                        </Typography>
                                        <Typography>
                                            {block?.criteriaText}
                                        </Typography>
                                    </Stack>
                                )}

                                {block?.hasRangeLimit && (
                                    <Stack
                                        direction="row"
                                        spacing={2}
                                        sx={{ alignItems: "center", py: 2 }}
                                    >
                                        <Typography variant="body2">
                                            {t("assignment:score")}
                                        </Typography>
                                        <SliderController
                                            control={control}
                                            name="score"
                                            min={0}
                                            max={100}
                                            marks
                                            step={block.granularity}
                                            sx={{
                                                padding: 0,
                                                maxWidth: (theme) =>
                                                    theme.spacing(60),
                                            }}
                                        />
                                        <Typography variant="body2">
                                            {watch("score")}
                                        </Typography>
                                    </Stack>
                                )}
                                {!block?.hasRangeLimit && (
                                    <NumberFieldController
                                        control={control}
                                        label={t("assignment:score")}
                                        name="score"
                                    />
                                )}
                                <TextFieldController
                                    control={control}
                                    name="justificationText"
                                    label={t("submission:teacherComment")}
                                    fullWidth
                                    multiline
                                    style={{ marginBottom: 32 }}
                                />
                            </Stack>
                        )}
                </Stack>
            </CardContent>
            {!submission.isApproved && (
                <CardActions>
                    <Align right>
                        {assignment.assessmentType ===
                            AssessmentType.teacher && (
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    reset({
                                        score: block?.feedback?.originalScore,
                                    });
                                    onSave({
                                        score: block?.feedback?.originalScore,
                                    });
                                }}
                                disabled={
                                    !block?.feedback?.originalScore ||
                                    block?.feedback?.score ===
                                        block?.feedback?.originalScore
                                }
                            >
                                {t("submission:resetScore")}
                            </Button>
                        )}
                    </Align>
                </CardActions>
            )}
        </Card>
    );
};
