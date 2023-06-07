import { Divider, Grid } from "@mui/material";
import { Permission, RoleType } from "core";
import { useAssignment } from "features/assignment/staff/api/Assignment.data";
import { AssignmentIntroductionOverview } from "features/assignment/staff/content/AssignmentIntroductionOverview";
import { AssignmentQuestionsEmpty } from "features/assignment/staff/content/AssignmentQuestionsEmpty";
import { AssignmentQuestionsOverview } from "features/assignment/staff/content/AssignmentQuestionsOverview";
import { AssignmentLayout } from "features/assignment/staff/layout/AssignmentLayout";
import { AddQuestionButton } from "features/question/staff/AddQuestionButton";
import { usePermission } from "hooks/usePermission";
import { useTranslation } from "react-i18next";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { Loading } from "ui/Loading";
import { PageHeading } from "ui/PageHeading";
import { useParams } from "ui/route/Params";

export default function AssignmentEditorPage() {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const { data, loading } = useAssignment(id);
    const can = usePermission();

    if (loading) {
        return <Loading />;
    }

    const assignment = data?.assignment;
    const module = assignment?.module;
    const course = module?.course;
    const blocks = assignment?.blocks || [];

    const readOnly = !can(Permission.updateCourse, course);

    if (course?.role === RoleType.courseStudent) {
        return <AccessErrorPage />;
    }

    return (
        <AssignmentLayout selected="content" assignment={assignment}>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <PageHeading title={t("assignment:questions")} />
                </Grid>
                {assignment?.hasIntroduction && (
                    <>
                        <Grid item xs={12}>
                            <AssignmentIntroductionOverview
                                assignment={assignment}
                                readOnly={readOnly}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Divider
                                sx={{ marginTop: "4px", marginBottom: "4px" }}
                            />
                        </Grid>
                    </>
                )}
                {blocks.length ? (
                    <>
                        <Grid item xs={12}>
                            <AssignmentQuestionsOverview
                                assignment={assignment}
                            />
                        </Grid>
                        {!readOnly && (
                            <Grid item>
                                <AddQuestionButton assignment={assignment} />
                            </Grid>
                        )}
                    </>
                ) : (
                    <Grid item xs={12}>
                        <AssignmentQuestionsEmpty assignment={assignment} />
                    </Grid>
                )}
            </Grid>
        </AssignmentLayout>
    );
}
