import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import FeedbackIcon from "@mui/icons-material/Feedback";
import { Box, Stack } from "@mui/material";
import { Permission } from "core";
import { usePermission } from "hooks/usePermission";
import { Action } from "interface/Action.interface";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { ColoredAvatar } from "ui/ColoredAvatar";
import { useAutosaveForm } from "ui/form/Autosave";

import { useUpdateAction } from "features/question/staff/Question.data";
import { useToast } from "hooks/useToast";
import { SwitchController } from "ui/form/SwitchController";
import { TextFieldController } from "ui/form/TextFieldController";
import { SummaryCardAction } from "./SummaryCardAction";

const MarkdownFieldController = dynamic(() =>
    import("ui/form/MarkdownFieldController").then(
        (mod) => mod.MarkdownFieldController
    )
);

export interface EditActionFeedbackProps {
    assignment: Assignment;
    block: Block;
    action: Action;
    disableMoveUp?: boolean;
    disableMoveDown?: boolean;
    index: number;
}

export function EditActionFeedback(props: EditActionFeedbackProps) {
    const { assignment, block, action, disableMoveUp, disableMoveDown, index } =
        props;
    const [updateActionMutation] = useUpdateAction();
    const { t } = useTranslation();
    const { showSuccessToast } = useToast();
    const can = usePermission();

    const module = assignment?.module;
    const course = module?.course;
    const readOnly = !can(Permission.updateCourse, course);

    // Form for the action editor
    const { control } = useAutosaveForm<Partial<Action>>({
        onSave: async (input) => {
            await updateActionMutation({
                variables: {
                    id: action.id,
                    input,
                },
            });
            showSuccessToast();
        },
        defaultValues: { ...action },
    });

    return (
        <SummaryCardAction
            title={t(`assignment:actionType_${action.type}`)}
            avatar={
                <ColoredAvatar>
                    <FeedbackIcon />
                </ColoredAvatar>
            }
            assignment={assignment}
            block={block}
            action={action}
            disableMoveUp={disableMoveUp}
            disableMoveDown={disableMoveDown}
            index={index}
        >
            <Stack spacing={2} alignItems="flex-start">
                <TextFieldController
                    control={control}
                    fullWidth
                    label={t("assignment:condition")}
                    name="condition"
                    disabled={readOnly}
                />
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <CheckIcon color="success" sx={{ marginRight: 1 }} />
                    <MarkdownFieldController
                        control={control}
                        fullWidth
                        label={t("assignment:actionTextOnMatch")}
                        multiline
                        name="text"
                        disabled={readOnly}
                    />
                </Box>
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <ClearIcon color="error" sx={{ marginRight: 1 }} />
                    <MarkdownFieldController
                        control={control}
                        fullWidth
                        label={t("assignment:actionTextOnMismatch")}
                        multiline
                        name="textOnMismatch"
                        disabled={readOnly}
                    />
                </Box>
                {assignment?.hasGrading && (
                    <SwitchController
                        control={control}
                        color="primary"
                        label={t("assignment:teacherOnly")}
                        name="teacherOnly"
                        disabled={readOnly}
                    />
                )}
                <SwitchController
                    control={control}
                    color="primary"
                    label={t("assignment:stopOnMatch")}
                    name="stopOnMatch"
                    disabled={readOnly}
                />
            </Stack>
        </SummaryCardAction>
    );
}
