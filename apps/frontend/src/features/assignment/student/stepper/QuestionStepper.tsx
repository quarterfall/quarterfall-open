import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useAuthContext } from "context/AuthProvider";
import { BlockType, Permission } from "core";
import { moduleIsOpen } from "features/module/student/utils/ModuleStudentUtils";
import { usePermission } from "hooks/usePermission";
import { Assignment } from "interface/Assignment.interface";
import { Submission } from "interface/Submission.interface";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { CircledNumberIcon } from "ui/CircledNumberIcon";
import { AssignmentStepperRemoveSubmissionButton } from "./AssignmentStepperRemoveSubmissionButton";

interface QuestionStepperProps {
    assignment: Assignment;
    submission?: Submission;
    publicKey?: string;
    step?: number;
    handleStep?: (_: number) => () => void;
}

export const QuestionStepper = (props: QuestionStepperProps) => {
    const { assignment, step, handleStep, submission, publicKey } = props;

    const { me } = useAuthContext();
    const { t } = useTranslation();
    const can = usePermission();

    const module = assignment?.module;
    const course = module?.course;
    const questions = assignment?.blocks || [];
    const allQuestionsCompleted = questions.every((b) => b.completed);
    const reviewComplete =
        submission?.studentRatingDifficulty &&
        submission?.studentRatingUsefulness;

    return (
        <>
            {questions.map((block, index) => {
                const questionCompleted = block.completed;
                const questionTitle =
                    block?.title ||
                    t("assignment:question").concat(` ${block.index + 1}`);
                const stepEnabled =
                    index > 0 ? questions[index - 1].completed : true;

                return (
                    <ListItemButton
                        key={`block_${block.id}`}
                        onClick={handleStep(index)}
                        selected={step === index}
                        autoFocus={step === index}
                        disabled={assignment?.forceBlockOrder && !stepEnabled}
                    >
                        <ListItemIcon>
                            {!submission?.submittedDate && questionCompleted ? (
                                <CheckCircleIcon
                                    color="secondary"
                                    sx={{ fontSize: 26, width: 26 }}
                                />
                            ) : (
                                <CircledNumberIcon
                                    index={index + 1}
                                    color={
                                        step === index
                                            ? "secondary"
                                            : "disabled"
                                    }
                                />
                            )}
                        </ListItemIcon>
                        <ListItemText
                            primary={questionTitle}
                            secondary={
                                submission?.isApproved &&
                                block.type !== BlockType.Text && (
                                    <>
                                        {t("submission:score")}:{" "}
                                        {block?.feedback?.score}
                                    </>
                                )
                            }
                        />
                    </ListItemButton>
                );
            })}
            {!course?.archived &&
                moduleIsOpen(module, course) &&
                !submission?.submittedDate && (
                    <ListItemButton
                        onClick={handleStep(questions.length)}
                        disabled={!allQuestionsCompleted}
                        selected={step === questions.length}
                        autoFocus={step === questions.length}
                    >
                        <ListItemIcon>
                            {reviewComplete ? (
                                <CheckCircleIcon
                                    color="secondary"
                                    sx={{ fontSize: 26, width: 26 }}
                                />
                            ) : (
                                <CircledNumberIcon
                                    index={questions.length + 1}
                                />
                            )}
                        </ListItemIcon>
                        <ListItemText>
                            {me && !publicKey
                                ? t("assignment:reviewAndSubmit")
                                : t("assignment:completed")}
                        </ListItemText>
                    </ListItemButton>
                )}

            {submission?.submittedDate && (
                <ListItemButton
                    onClick={handleStep(questions.length)}
                    selected={step === questions.length}
                >
                    <ListItemIcon>
                        <CircledNumberIcon
                            index={questions.length + 1}
                            color={
                                step === questions.length
                                    ? "secondary"
                                    : "disabled"
                            }
                        />
                    </ListItemIcon>
                    <ListItemText>{t("assignment:summary")}</ListItemText>
                </ListItemButton>
            )}

            {submission &&
                can(Permission.deleteSubmission, course) &&
                !assignment?.hasGrading && (
                    <Align center>
                        <AssignmentStepperRemoveSubmissionButton
                            submission={submission}
                        />
                    </Align>
                )}
        </>
    );
};
