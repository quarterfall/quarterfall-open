import {
    Card,
    CardContent,
    CardHeader,
    Divider,
    Grid,
    Typography,
} from "@mui/material";
import { useAssignment } from "features/assignment/staff/api/Assignment.data";
import { AssignmentLayout } from "features/assignment/staff/layout/AssignmentLayout";
import { QuestionCard } from "features/question/staff/QuestionCard";
import { Block } from "interface/Block.interface";
import { useTranslation } from "react-i18next";
import { ClickableCard } from "ui/ClickableCard";
import { Loading } from "ui/Loading";
import { PageHeading } from "ui/PageHeading";
import { useNavigation } from "ui/route/Navigation";
import { useParams } from "ui/route/Params";

export const AssignmentViewerPage = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const router = useNavigation();

    const { data, loading } = useAssignment(id);

    if (loading || !data) {
        return <Loading />;
    }

    const assignment = data?.assignment;
    const blocks = assignment?.blocks || [];

    return (
        <AssignmentLayout selected="content" assignment={assignment}>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <PageHeading title={t("assignment:questions")} />
                </Grid>
                <Grid item xs={12}>
                    <ClickableCard
                        onClick={() =>
                            router.push(
                                `/assignment/${assignment.id}/introduction`
                            )
                        }
                    >
                        <CardHeader
                            title={
                                <Typography variant="h5">
                                    {t("introduction")}
                                </Typography>
                            }
                        />
                        <CardContent>
                            {t("assignment:editIntroductionBody")}
                        </CardContent>
                    </ClickableCard>
                </Grid>

                <Grid item xs={12}>
                    <Divider sx={{ marginTop: "4px", marginBottom: "4px" }} />
                </Grid>

                <Grid item xs={12}>
                    {blocks.length > 0 ? (
                        <Grid item xs={12}>
                            <Grid container spacing={1} direction="column">
                                {blocks.map((block: Block) => {
                                    const key = `block_${block.id}`;
                                    return (
                                        <Grid
                                            item
                                            key={key}
                                            style={{ width: "100%" }}
                                        >
                                            <QuestionCard
                                                assignment={assignment}
                                                block={block}
                                            />
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Grid>
                    ) : (
                        <Card>
                            <CardHeader
                                title={
                                    <Typography variant="h5">
                                        {t("assignment:questions")}
                                    </Typography>
                                }
                            />
                            <CardContent>
                                {t("assignment:noQuestionsText")}
                            </CardContent>
                        </Card>
                    )}
                </Grid>
            </Grid>
        </AssignmentLayout>
    );
};
