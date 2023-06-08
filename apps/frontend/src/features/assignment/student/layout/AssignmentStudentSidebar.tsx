import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import {
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
} from "@mui/material";
import { RoleType } from "core";
import { Assignment } from "interface/Assignment.interface";
import { Submission } from "interface/Submission.interface";
import { useTranslation } from "react-i18next";
import { useNavigation } from "ui/route/Navigation";
import { QuestionStepper } from "../stepper/QuestionStepper";
import { AssignmentStudentSidebarHeader } from "./AssignmentStudentSidebarHeader";

export type AssignmentStudentSidebarItem =
    | "content"
    | "introduction"
    | "files"
    | "analytics"
    | "submissions"
    | "grading"
    | "settings";

export interface AssignmentStudentSidebarProps {
    selected?: AssignmentStudentSidebarItem;
    blockId?: string;
    assignment: Assignment;
    submission?: Submission;
    publicKey?: string;
    step?: number;
    handleStep?: (step: number) => () => void;
}

export function AssignmentStudentSidebar(props: AssignmentStudentSidebarProps) {
    const { assignment, submission, publicKey, step, handleStep } = props;

    const { t } = useTranslation();
    const router = useNavigation();

    const module = assignment?.module;
    const course = module?.course;

    const isStudent = course?.role === RoleType.courseStudent;

    return (
        <>
            <List style={{ paddingTop: 0 }}>
                <AssignmentStudentSidebarHeader assignment={assignment} />
                {isStudent && (
                    <ListItemButton
                        onClick={
                            module
                                ? () =>
                                      router.push(
                                          `/student/module/${module.id}`
                                      )
                                : () => router.back()
                        }
                    >
                        <ListItemIcon>
                            <ChevronLeftIcon />
                        </ListItemIcon>
                        <ListItemText
                            disableTypography
                            primary={
                                <Typography variant="button">
                                    {module ? t("module") : t("back")}
                                </Typography>
                            }
                        />
                    </ListItemButton>
                )}
                <Divider />

                <QuestionStepper
                    assignment={assignment}
                    step={step}
                    handleStep={handleStep}
                    submission={submission}
                    publicKey={publicKey}
                />
            </List>
        </>
    );
}
