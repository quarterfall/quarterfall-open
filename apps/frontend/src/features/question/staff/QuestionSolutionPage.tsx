import { Alert, Grid } from "@mui/material";
import { Permission } from "core";
import { useUpdateBlock } from "features/assignment/staff/api/Assignment.data";
import { AssignmentLayout } from "features/assignment/staff/layout/AssignmentLayout";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";
import { PreviewContainer } from "ui/PreviewContainer";
import { QuestionHeader } from "./QuestionHeader";
const Markdown = dynamic(() => import("ui/markdown/Markdown"));
const MarkdownFieldController = dynamic(() =>
    import("ui/form/MarkdownFieldController").then(
        (mod) => mod.MarkdownFieldController
    )
);

export interface BlockSolutionTabProps {
    assignment: Assignment;
    block: Block;
}

export const QuestionSolutionPage = ({
    assignment,
    block,
}: BlockSolutionTabProps) => {
    const { t } = useTranslation();
    const [updateBlockMutation] = useUpdateBlock();
    const { showSuccessToast } = useToast();
    const can = usePermission();

    const module = assignment?.module;
    const course = module?.course;
    const blocks = assignment?.blocks || [];

    const readOnly = !can(Permission.updateCourse, course);

    const { control } = useAutosaveForm({
        onSave: async (input) => {
            await updateBlockMutation({
                variables: {
                    id: block.id,
                    input,
                },
            });
            showSuccessToast();
        },
        defaultValues: { ...block },
    });

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
            <Grid container direction="column" spacing={1}>
                <Grid item xs={12}>
                    <QuestionHeader assignment={assignment} block={block} />
                </Grid>

                <Grid item xs={12}>
                    {readOnly && !block.solution ? (
                        <Alert severity="info">
                            {t("assignment:courseArchivedNoSolution")}
                        </Alert>
                    ) : (
                        <PreviewContainer
                            preview={
                                <Markdown files={assignment.files}>
                                    {block.solution}
                                </Markdown>
                            }
                            readOnly={readOnly}
                        >
                            <MarkdownFieldController
                                fullWidth
                                multiline
                                minRows={3}
                                maxRows={Infinity}
                                label={t("solution")}
                                name="solution"
                                control={control}
                            />
                        </PreviewContainer>
                    )}
                </Grid>
            </Grid>
        </AssignmentLayout>
    );
};
