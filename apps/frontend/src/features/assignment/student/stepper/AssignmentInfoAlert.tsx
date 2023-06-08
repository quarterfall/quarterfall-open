import { Alert } from "@mui/material";
import { format } from "date-fns";
import {
    assignmentIsOpen,
    getAssignmentEndDate,
} from "features/assignment/utils/AssignmentUtils";
import { Assignment } from "interface/Assignment.interface";
import { Course } from "interface/Course.interface";
import { Submission } from "interface/Submission.interface";
import { useTranslation } from "react-i18next";
import { useDateLocale } from "ui/hooks/DateLocale";

interface AssignmentInfoAlertProps {
    assignment: Assignment;
    submission?: Submission;
    course?: Course;
}

export const AssignmentInfoAlert = (props: AssignmentInfoAlertProps) => {
    const { assignment, submission, course } = props;

    const { locale } = useDateLocale();

    const submitted = Boolean(submission?.submittedDate);
    const open = assignmentIsOpen(assignment);
    const endDate = getAssignmentEndDate(assignment);

    const { t } = useTranslation();

    if (course?.archived) {
        return (
            <Alert severity="warning">
                {t("assignment:courseArchivedMessage")}
            </Alert>
        );
    }

    if (!submitted && !open && endDate) {
        <Alert severity="warning">
            {t("assignment:moduleClosed", {
                date: format(endDate, "PPp", {
                    locale,
                }),
            })}
        </Alert>;
    }

    return null;
};
