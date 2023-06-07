import { Grid } from "@mui/material";
import { AssignmentIntroductionEditorCard } from "features/assignment/staff/introduction/AssignmentEditorIntroductionCard";
import { AssignmentLayout } from "features/assignment/staff/layout/AssignmentLayout";
import { useTranslation } from "react-i18next";
import { PageHeading } from "ui/PageHeading";

export const AssignmentIntroductionPage = (props) => {
    const { t } = useTranslation();
    const { assignment } = props;

    return (
        <AssignmentLayout selected="introduction" assignment={assignment}>
            <Grid container spacing={1} direction="column">
                <Grid item xs={12}>
                    <PageHeading title={t("introduction")} />
                </Grid>
                <Grid item xs={12} style={{ width: "100%" }}>
                    <AssignmentIntroductionEditorCard assignment={assignment} />
                </Grid>
            </Grid>
        </AssignmentLayout>
    );
};
