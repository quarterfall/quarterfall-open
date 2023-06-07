import { Alert, Chip, Container, Stack, useMediaQuery } from "@mui/material";
import { useAuthContext } from "context/AuthProvider";
import { Permission } from "core";
import {
    assignmentQuery,
    useStartSubmission,
} from "features/assignment/student/Assignment.data";
import { AssignmentStudentLayout } from "features/assignment/student/layout/AssignmentStudentLayout";
import { AssignmentReport } from "features/assignment/student/stepper/AssignmentReport";
import { AssignmentStepper } from "features/assignment/student/stepper/AssignmentStepper";
import {
    assignmentIsOpen,
    assignmentWillOpen,
} from "features/assignment/utils/AssignmentUtils";
import { usePermission } from "hooks/usePermission";
import { Assignment } from "interface/Assignment.interface";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PageHeading } from "ui/PageHeading";
import { useQueryParams } from "ui/route/QueryParams";

export interface AssignmentStudentViewPageProps {
    assignment: Assignment;
    publicKey?: string;
}

export function AssignmentStudentViewPage(
    props: AssignmentStudentViewPageProps
) {
    const { assignment, publicKey } = props;
    const { t } = useTranslation();
    const { me } = useAuthContext();
    const module = assignment?.module;
    const course = module?.course;
    const can = usePermission();
    const isMobile = useMediaQuery("(max-width:599px)");

    const [params, updateParams] = useQueryParams<{
        step: number;
    }>({
        step: 0,
    });

    const handleStep = (step) => () => {
        updateParams({
            step,
        });
    };

    const [startSubmissionMutation] = useStartSubmission();

    let submission = assignment?.submission;

    const submitted = Boolean(submission?.submittedDate);
    const open =
        publicKey ||
        (assignmentWillOpen(assignment) &&
            can(Permission.testAssignment, course)) ||
        (!publicKey && assignmentIsOpen(assignment));

    useEffect(() => {
        if (!course?.archived && !publicKey && !submission) {
            startSubmissionMutation({
                variables: {
                    id: assignment?.id,
                },
                refetchQueries: [
                    {
                        query: assignmentQuery,
                        variables: { id: assignment?.id },
                    },
                ],
            });
        }
    }, []);

    return (
        <AssignmentStudentLayout
            assignment={assignment}
            submission={submission}
            publicKey={publicKey}
            step={params.step}
            handleStep={handleStep}
        >
            <Stack direction="column" spacing={1}>
                {me && !me?.isStudent && !publicKey && (
                    <Alert severity="info">
                        {t("assignment:teacherTestViewAlert")}
                    </Alert>
                )}

                <PageHeading
                    title={assignment.title || t("assignment:noTitle")}
                    description={
                        assignment?.hasGrading && (
                            <Chip
                                label={t("assignment:hasGrading")}
                                variant="outlined"
                                sx={{
                                    fontSize: (theme) => theme.spacing(1.5),
                                    height: (theme) => theme.spacing(2.5),
                                    paddingRight: 0,
                                    paddingLeft: 0,
                                    marginBottom: 1,
                                    "& .MuiChip-label": {
                                        paddingRight: 1,
                                        paddingLeft: 1,
                                    },
                                    "& .MuiChip-avatar": {
                                        width: (theme) => theme.spacing(2),
                                        height: (theme) => theme.spacing(2),
                                    },
                                }}
                            />
                        )
                    }
                />

                <Container
                    maxWidth={!isMobile ? "lg" : null}
                    disableGutters
                    sx={{ alignSelf: "center" }}
                >
                    {submitted || !open ? (
                        <AssignmentReport
                            assignment={assignment}
                            submission={submission}
                            params={params}
                            updateParams={updateParams}
                        />
                    ) : (
                        <AssignmentStepper
                            assignment={assignment}
                            submission={submission}
                            publicKey={publicKey}
                            params={params}
                            updateParams={updateParams}
                        />
                    )}
                </Container>
            </Stack>
        </AssignmentStudentLayout>
    );
}
