import RestoreIcon from "@mui/icons-material/Restore";
import { Button, Stack } from "@mui/material";
import { Permission } from "core";
import {
    assignmentIsOpen,
    getAssignmentEndDate,
} from "features/assignment/utils/AssignmentUtils";
import { SubmissionQuestionCard } from "features/submission/question/SubmissionQuestionCard";
import { useDeleteSubmission } from "features/submission/Submission.data";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { Submission } from "interface/Submission.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { useDateLocale } from "ui/hooks/DateLocale";
import { useNavigation } from "ui/route/Navigation";
import { AssignmentInfoAlert } from "./AssignmentInfoAlert";
import { AssignmentIntroductionCard } from "./AssignmentIntroductionCard";
import { AssignmentSticker } from "./AssignmentSticker";
import { AssignmentSummaryStep } from "./AssignmentSummaryStep";

export interface AssignmentReportProps {
    assignment: Assignment;
    submission?: Submission;
    params?: any;
    updateParams?: (_: any) => void;
}

export function AssignmentReport(props: AssignmentReportProps) {
    const { assignment, submission, params, updateParams } = props;
    const { t } = useTranslation();
    const can = usePermission();
    const { locale } = useDateLocale();
    const { showSuccessToast } = useToast();
    const router = useNavigation();

    const [removeSubmissionsDialogOpen, setRemoveSubmissionsDialogOpen] =
        useState(false);

    const module = assignment?.module;
    const course = module?.course;
    const blocks = assignment.blocks || [];

    const activeBlock =
        blocks.length > 0 && params.step < blocks.length
            ? { ...blocks[params.step] }
            : null;

    const submitted = Boolean(submission?.submittedDate);
    const open = assignmentIsOpen(assignment);
    const endDate = getAssignmentEndDate(assignment);

    const [deleteSubmissionMutation] = useDeleteSubmission();

    const handleRemoveSubmission = async () => {
        await deleteSubmissionMutation({
            variables: {
                id: submission?.id,
            },
        });
        showSuccessToast(t("submission:deletedNotification"));
        setRemoveSubmissionsDialogOpen(false);
        router.hardReload();
    };

    return (
        <Stack direction="column" spacing={1} sx={{ position: "relative" }}>
            <AssignmentInfoAlert
                assignment={assignment}
                submission={submission}
                course={course}
            />
            {submission?.sticker && (
                <AssignmentSticker
                    id={submission?.id}
                    sticker={submission?.sticker}
                    approved={submission?.isApproved}
                />
            )}

            {params.step !== blocks.length &&
                assignment.hasIntroduction &&
                assignment?.introduction && (
                    <AssignmentIntroductionCard
                        assignment={assignment}
                        hideTitle
                    />
                )}

            {params.step < blocks.length && (
                <SubmissionQuestionCard
                    assignment={assignment}
                    submission={submission}
                    index={activeBlock?.index}
                    block={activeBlock}
                    showTitle
                />
            )}

            {params.step === blocks.length && (
                <AssignmentSummaryStep assignment={assignment} />
            )}

            {submission &&
                can(Permission.deleteSubmission, course) &&
                !assignment.hasGrading && (
                    <>
                        <Align right>
                            <Button
                                variant="outlined"
                                size="large"
                                startIcon={<RestoreIcon />}
                                color="error"
                                onClick={() => {
                                    setRemoveSubmissionsDialogOpen(true);
                                }}
                            >
                                {t("assignment:redoAssignmentTitle")}
                            </Button>
                        </Align>
                        <ConfirmationDialog
                            open={removeSubmissionsDialogOpen}
                            title={t("assignment:confirmRedoAssignmentTitle")}
                            message={t(
                                "assignment:confirmRedoAssignmentMessage"
                            )}
                            onContinue={handleRemoveSubmission}
                            onCancel={() => {
                                setRemoveSubmissionsDialogOpen(false);
                            }}
                        />
                    </>
                )}
        </Stack>
    );
}
