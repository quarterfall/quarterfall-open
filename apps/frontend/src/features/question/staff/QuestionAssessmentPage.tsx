import { Box, Card, CardContent, CardHeader, Grid, Stack } from "@mui/material";
import { BlockIcon } from "components/icons";
import { useStore } from "context/UIStoreProvider";
import { BlockType, EditorType, Permission, ProgrammingLanguage } from "core";
import { AssignmentLayout } from "features/assignment/staff/layout/AssignmentLayout";
import { usePermission } from "hooks/usePermission";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ColoredAvatar } from "ui/ColoredAvatar";
import { DividerText } from "ui/DividerText";
import { AssessmentSettingsCard } from "./AssessmentSettingsCard";
import { PreviewQuestion } from "./PreviewQuestion";
import { QuestionHeader } from "./QuestionHeader";
const QuestionActions = dynamic(() => import("./QuestionActions"));

interface QuestionAssessmentPageProps {
    assignment: Assignment;
    block: Block;
}

export const QuestionAssessmentPage = (props: QuestionAssessmentPageProps) => {
    const { t } = useTranslation();
    const { assignment, block } = props;
    const { showPreview, setShowPreview } = useStore();

    const can = usePermission();

    const module = assignment?.module;
    const course = module?.course;
    const blocks = assignment?.blocks || [];
    const readOnly = !can(Permission.updateCourse, course);

    const title = ` ${
        block.title
            ? block.title
            : `${t("assignment:question")} ${block.index + 1}`
    }`;

    const subheader = useMemo(() => {
        switch (block.type) {
            case BlockType.MultipleChoiceQuestion:
                return block.multipleCorrect
                    ? t("assignment:multipleChoiceLabelStudent")
                    : t("assignment:singleChoiceLabelStudent");
            case BlockType.OpenQuestion:
                return t(
                    `assignment:editor_${block.editor || EditorType.Text}`
                );
            case BlockType.CodeQuestion:
                return t(
                    `programmingLanguage_${
                        block.programmingLanguage || ProgrammingLanguage.other
                    }`
                );
            default:
                return undefined;
        }
    }, [block]);

    const renderTestAssessment = (showPreview: boolean) => {
        return (
            <Stack>
                <DividerText text={t("assignment:testQuestion")} />
                <Card>
                    <CardHeader
                        title={title}
                        subheader={subheader}
                        avatar={
                            <ColoredAvatar>
                                <BlockIcon
                                    type={block.type}
                                    multipleCorrect={block.multipleCorrect}
                                />
                            </ColoredAvatar>
                        }
                    />
                    <CardContent>
                        <PreviewQuestion
                            assignment={assignment}
                            block={block}
                            showCheckAnswer={!readOnly}
                        />
                    </CardContent>
                </Card>
            </Stack>
        );
    };

    return (
        <AssignmentLayout
            assignment={assignment}
            blockId={block.id}
            selected={
                !assignment.hasIntroduction && blocks.length === 1
                    ? "content"
                    : undefined
            }
        >
            <Stack>
                <QuestionHeader assignment={assignment} block={block} />
                <Grid container item spacing={2} direction="row">
                    <Grid
                        container
                        item
                        xs={12}
                        spacing={2}
                        lg={showPreview && !readOnly ? 6 : 12}
                        direction="column"
                    >
                        <Grid item sx={{ width: "100%" }}>
                            <AssessmentSettingsCard
                                block={block}
                                assignment={assignment}
                                showTestAssessment={showPreview && !readOnly}
                                setShowTestAssessment={setShowPreview}
                                readOnly={readOnly}
                            />
                        </Grid>
                        <Grid item>
                            <QuestionActions
                                assignment={assignment}
                                block={block}
                            />
                        </Grid>
                    </Grid>
                    {showPreview && !readOnly && (
                        <Grid item xs={12} lg={6}>
                            {renderTestAssessment(showPreview)}
                        </Grid>
                    )}
                </Grid>
                <Box sx={{ height: 20 }} />
            </Stack>
        </AssignmentLayout>
    );
};
