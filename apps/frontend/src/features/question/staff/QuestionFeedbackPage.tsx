import {
    Alert,
    Box,
    Card,
    CardContent,
    CardHeader,
    Grid,
    Stack,
} from "@mui/material";
import { BlockIcon } from "components/icons";
import {
    ActionType,
    BlockType,
    EditorType,
    Permission,
    ProgrammingLanguage,
} from "core";
import { AssignmentLayout } from "features/assignment/staff/layout/AssignmentLayout";
import { usePermission } from "hooks/usePermission";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ColoredAvatar } from "ui/ColoredAvatar";
import { DividerText } from "ui/DividerText";
import { PreviewQuestion } from "./PreviewQuestion";

import { QuestionActionsEmpty } from "./QuestionActionsEmpty";
import { QuestionHeader } from "./QuestionHeader";
const QuestionActions = dynamic(() => import("./QuestionActions"));

interface QuestionFeedbackPageProps {
    assignment: Assignment;
    block: Block;
}

export const QuestionFeedbackPage = (props: QuestionFeedbackPageProps) => {
    const { t } = useTranslation();
    const { assignment, block } = props;
    const actions = block.actions || [];

    const can = usePermission();

    const module = assignment?.module;
    const course = module?.course;
    const blocks = assignment?.blocks || [];
    const readOnly = !can(Permission.updateCourse, course);

    let showCheckAnswer = true;
    if (
        (actions &&
            actions.length === 1 &&
            actions[0].type === ActionType.UnitTest &&
            !actions[0].tests?.length) ||
        readOnly
    ) {
        showCheckAnswer = false;
    }

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

    const renderFeedbackEditor = () => (
        <Grid container spacing={2}>
            <Grid item xs={12} lg={6}>
                <QuestionActions assignment={assignment} block={block} />
            </Grid>
            <Grid item xs={12} lg={6}>
                <DividerText text={t("testQuestion")} />
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
                            showCheckAnswer={showCheckAnswer}
                        />
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

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
                {actions.length > 0 ? (
                    renderFeedbackEditor()
                ) : readOnly ? (
                    <Alert severity="info">
                        {t("assignment:courseArchivedNoFeedback")}
                    </Alert>
                ) : (
                    <QuestionActionsEmpty
                        assignment={assignment}
                        block={block}
                    />
                )}

                <Box sx={{ height: 20 }} />
            </Stack>
        </AssignmentLayout>
    );
};
