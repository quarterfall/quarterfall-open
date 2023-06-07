import AssessmentIcon from "@mui/icons-material/Assessment";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    darken,
    Grid,
    lighten,
} from "@mui/material";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { useTranslation } from "react-i18next";
import { AssessmentSettingsForm } from "./AssessmentSettingsForm";
import { ClosedFormAssessmentSettingsForm } from "./ClosedFormAssessmentSettingsForm";

export interface AssessmentSettingsCardProps {
    block: Block;
    assignment: Assignment;
    showTestAssessment: boolean;
    setShowTestAssessment: (value: boolean) => void;
    readOnly: boolean;
}

export const AssessmentSettingsCard = (props: AssessmentSettingsCardProps) => {
    const {
        block,
        assignment,
        showTestAssessment,
        setShowTestAssessment,
        readOnly,
    } = props;
    const { t } = useTranslation();

    return (
        <Card
            sx={{
                backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                        ? lighten(theme.palette.background.paper, 0.15)
                        : darken(theme.palette.background.paper, 0.1),
                padding: 1,
            }}
        >
            <CardHeader
                title={t("assignment:questionAssessmentSettings")}
                avatar={<AssessmentIcon color="secondary" />}
                action={
                    <Button
                        onClick={() =>
                            setShowTestAssessment(!showTestAssessment)
                        }
                        disabled={readOnly}
                        size="small"
                        startIcon={
                            showTestAssessment ? null : <ChevronLeftIcon />
                        }
                        endIcon={
                            showTestAssessment ? <ChevronRightIcon /> : null
                        }
                    >
                        {showTestAssessment
                            ? t("assignment:hideTest")
                            : t("assignment:showTest")}
                    </Button>
                }
            />
            <CardContent>
                <Grid container direction="column" spacing={3}>
                    <Grid item>
                        <AssessmentSettingsForm
                            block={block}
                            assignment={assignment}
                            readOnly={readOnly}
                        />
                    </Grid>
                    <Grid item>
                        <ClosedFormAssessmentSettingsForm
                            block={block}
                            assignment={assignment}
                            readOnly={readOnly}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};
