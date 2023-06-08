import { Alert } from "@mui/material";
import { Permission } from "core";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Assignment } from "interface/Assignment.interface";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";
import { PreviewContainer } from "ui/PreviewContainer";
import { useUpdateAssignment } from "../api/Assignment.data";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));
const MarkdownFieldController = dynamic(() =>
    import("ui/form/MarkdownFieldController").then(
        (mod) => mod.MarkdownFieldController
    )
);

export interface AssignmentIntroductionEditorCardProps {
    assignment: Assignment;
}

export const AssignmentIntroductionEditorCard = ({
    assignment,
}: AssignmentIntroductionEditorCardProps) => {
    const can = usePermission();
    const module = assignment?.module;
    const course = module?.course;

    const readOnly = !can(Permission.updateCourse, course);

    const [updateAssignmentMutation] = useUpdateAssignment();
    const { showSuccessToast } = useToast();
    const { t } = useTranslation();

    const { control, reset } = useAutosaveForm({
        onSave: async (input) => {
            await updateAssignmentMutation({
                variables: {
                    id: assignment.id,
                    input,
                },
            });
            showSuccessToast();
        },
        defaultValues: {
            ...assignment,
        },
    });

    useEffect(() => {
        reset(assignment);
    }, [assignment.id]);

    return !assignment?.introduction && readOnly ? (
        <Alert severity="info">
            {t("assignment:courseArchivedNoIntroduction")}
        </Alert>
    ) : (
        <PreviewContainer
            preview={
                <Markdown files={assignment.files}>
                    {assignment?.introduction}
                </Markdown>
            }
            readOnly={readOnly}
        >
            <MarkdownFieldController
                fullWidth
                multiline
                onClick={(event) => event.stopPropagation()}
                minRows={3}
                maxRows={Infinity}
                label={t("introduction")}
                name="introduction"
                control={control}
                data-cy="assignmentIntroductionMarkdownField"
            />
        </PreviewContainer>
    );
};
