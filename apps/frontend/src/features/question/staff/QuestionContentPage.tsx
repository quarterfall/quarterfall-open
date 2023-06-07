import { Box, Stack } from "@mui/material";
import { Permission } from "core";
import { AssignmentLayout } from "features/assignment/staff/layout/AssignmentLayout";
import { usePermission } from "hooks/usePermission";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { Align } from "ui/Align";
import { PreviewContainer } from "ui/PreviewContainer";
import { AddQuestionButton } from "./AddQuestionButton";

import { EditQuestion } from "./EditQuestion";
import { PreviewQuestion } from "./PreviewQuestion";
import { QuestionHeader } from "./QuestionHeader";
export interface BlockCardProps {
    assignment: Assignment;
    block: Block;
}

export const QuestionContentPage = (props: BlockCardProps) => {
    const { assignment, block } = props;
    const can = usePermission();

    const module = assignment?.module;
    const course = module?.course;
    const blocks = assignment?.blocks || [];
    const readOnly = !can(Permission.updateCourse, course);
    const hasOneQuestion = !assignment?.hasIntroduction && blocks?.length === 1;

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
            <Stack spacing={1}>
                <QuestionHeader assignment={assignment} block={block} />
                <PreviewContainer
                    preview={
                        <PreviewQuestion
                            assignment={assignment}
                            block={block}
                        />
                    }
                    readOnly={readOnly}
                >
                    <EditQuestion block={block} />
                </PreviewContainer>
                {!readOnly && hasOneQuestion && (
                    <Align left>
                        <AddQuestionButton assignment={assignment} />
                    </Align>
                )}
                <Box sx={{ height: 20 }} />
            </Stack>
        </AssignmentLayout>
    );
};
