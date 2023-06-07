import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import SubmitIcon from "@mui/icons-material/Send";
import {
    Alert,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Stack,
} from "@mui/material";
import { useAuthContext } from "context/AuthProvider";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { useAutosaveForm } from "ui/form/Autosave";
import { LabeledRatingController } from "ui/form/RatingFieldController";
import { TextFieldController } from "ui/form/TextFieldController";
import { useNavigation } from "ui/route/Navigation";
import { useQueryParams } from "ui/route/QueryParams";
import { WaitingOverlay } from "ui/WaitingOverlay";
import {
    useSubmitAssignment,
    useUpdateAssignmentReview,
} from "../Assignment.data";
const Markdown = dynamic(() => import("ui/markdown/Markdown"));

export interface AssignmentReviewCardProps {
    assignment: Assignment;
    readOnly?: boolean;
    index?: number;
    onClickPreviousBlock?: () => void;
}

export function AssignmentReviewCard(props: AssignmentReviewCardProps) {
    const {
        assignment,
        index = 0,
        readOnly = false,
        onClickPreviousBlock,
    } = props;

    const [submitWaiting, setSubmitWaiting] = useState(false);
    const [updateWaiting, setUpdateWaiting] = useState(false);

    const submission = assignment?.submission;

    const defaultValues = {
        studentRatingDifficulty: submission?.studentRatingDifficulty,
        studentRatingUsefulness: submission?.studentRatingUsefulness,
        studentComment: submission?.studentComment,
    };
    const [isDirty, setDirty] = useState<boolean>(
        !!defaultValues.studentRatingDifficulty &&
            !!defaultValues.studentRatingUsefulness
    );
    const { t } = useTranslation();
    const [submitAssignmentMutation] = useSubmitAssignment();
    const [updateAssignmentReviewMutation] = useUpdateAssignmentReview();
    const { showSuccessToast } = useToast();
    const router = useNavigation();
    const { me } = useAuthContext();
    const [params, updateParams] = useQueryParams<{ step: number }>({
        step: 0,
    });

    // verify that all blocks have been completed
    const allBlocksCompleted = (assignment.blocks || []).every(
        (b) => b.completed
    );

    const onClickSubmit = async () => {
        setSubmitWaiting(true);
        await submitAssignmentMutation({
            variables: {
                id: submission?.id,
                input: { ...defaultValues },
            },
        });
        setSubmitWaiting(false);
        if (me?.isStudent) {
            router.push(`/student/module/${assignment.module.id}`);
        } else {
            updateParams({ step: 0 });
        }
        if (assignment.isStudyMaterial) {
            showSuccessToast(
                t("assignment:studyMaterialSubmitted", {
                    title: assignment.title,
                })
            );
        } else {
            showSuccessToast(
                t("assignment:submitted", { title: assignment.title })
            );
        }
    };

    // Form for the assignment review update
    const {
        control,
        formState: { isValid },
        watch,
    } = useAutosaveForm<{
        studentRatingDifficulty: number;
        studentRatingUsefulness: number;
        studentComment: string;
    }>({
        onSave: async (input) => {
            if (submitWaiting) {
                return;
            }
            setUpdateWaiting(true);
            // we always want to update, even if the form is not valid
            const result = await updateAssignmentReviewMutation({
                variables: {
                    id: submission?.id,
                    input,
                },
            });
            const updatedSub = result.data.updateAssignmentReview.submission;
            const { studentRatingDifficulty, studentRatingUsefulness } =
                updatedSub;
            setDirty(!!studentRatingDifficulty && !!studentRatingUsefulness);
            setUpdateWaiting(false);
            showSuccessToast();
        },
        defaultValues,
    });

    // don't show anything in readonly mode if there is no information
    if (
        readOnly &&
        !assignment.submission?.studentRatingDifficulty &&
        !assignment.submission?.studentRatingUsefulness &&
        !assignment.submission?.studentComment
    ) {
        return null;
    }

    return (
        <Card>
            <CardHeader
                title={
                    readOnly
                        ? t("assignment:studentReview")
                        : t("assignment:reviewAndSubmit")
                }
            />
            <form>
                <CardContent>
                    <Stack spacing={1} alignItems="flex-start">
                        {!readOnly && !allBlocksCompleted && (
                            <Alert severity="warning" style={{ width: "100%" }}>
                                {t("assignment:studentCompleteBlocksWarning")}
                            </Alert>
                        )}
                        {!readOnly &&
                            allBlocksCompleted &&
                            (!isValid || !isDirty) && (
                                <Alert
                                    severity="warning"
                                    style={{ width: "100%" }}
                                >
                                    {t(
                                        "assignment:studentReviewAssignmentWarning"
                                    )}
                                </Alert>
                            )}
                        {/* Difficulty */}
                        <LabeledRatingController
                            readOnly={readOnly}
                            legend={t(
                                "assignment:studentRatingDifficultyLegend"
                            )}
                            ratingLabel={(rating) =>
                                t(`assignment:difficultyRating_${rating}`)
                            }
                            name="studentRatingDifficulty"
                            control={control}
                            disabled={readOnly || submitWaiting}
                        />
                        {/* Usefulness */}
                        <LabeledRatingController
                            readOnly={readOnly}
                            legend={t(
                                "assignment:studentRatingUsefulnessLegend"
                            )}
                            ratingLabel={(rating) =>
                                t(`assignment:usefulnessRating_${rating}`)
                            }
                            name="studentRatingUsefulness"
                            control={control}
                            disabled={readOnly || submitWaiting}
                        />

                        {/* Comment */}
                        {!readOnly && (
                            <TextFieldController
                                fullWidth
                                multiline
                                minRows={3}
                                maxRows={Infinity}
                                label={t("assignment:studentCommentLegend")}
                                name="studentComment"
                                control={control}
                                disabled={readOnly || submitWaiting}
                                style={{ marginTop: 12 }}
                            />
                        )}
                        {readOnly && assignment.submission?.studentComment && (
                            <Markdown>
                                {assignment.submission?.studentComment}
                            </Markdown>
                        )}
                    </Stack>
                </CardContent>
                {!readOnly && (
                    <CardActions>
                        <Align left>
                            {index > 0 && onClickPreviousBlock && (
                                <Button
                                    startIcon={<ChevronLeftIcon />}
                                    onClick={onClickPreviousBlock}
                                >
                                    {t("previous")}
                                </Button>
                            )}
                        </Align>
                        <Align right>
                            <WaitingOverlay waiting={submitWaiting}>
                                <Button
                                    color="primary"
                                    endIcon={<SubmitIcon />}
                                    disabled={
                                        !isValid ||
                                        !isDirty ||
                                        submitWaiting ||
                                        updateWaiting ||
                                        !allBlocksCompleted
                                    }
                                    onClick={onClickSubmit}
                                >
                                    {t("assignment:submit")}
                                </Button>
                            </WaitingOverlay>
                        </Align>
                    </CardActions>
                )}
            </form>
        </Card>
    );
}
