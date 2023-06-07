import WebhookIcon from "@mui/icons-material/ImportExport";
import { isURL, Permission } from "core";
import { useUpdateAction } from "features/question/staff/Question.data";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Action } from "interface/Action.interface";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { useTranslation } from "react-i18next";
import { ColoredAvatar } from "ui/ColoredAvatar";
import { useAutosaveForm } from "ui/form/Autosave";
import { TextFieldController } from "ui/form/TextFieldController";
import { SummaryCardAction } from "./SummaryCardAction";

export interface EditActionWebhookProps {
    assignment: Assignment;
    block: Block;
    action: Action;
    disableMoveUp?: boolean;
    disableMoveDown?: boolean;
    index: number;
}

export function EditActionWebhook(props: EditActionWebhookProps) {
    const { assignment, block, action, disableMoveUp, disableMoveDown, index } =
        props;
    const [updateActionsMutation] = useUpdateAction();
    const { t } = useTranslation();
    const { showSuccessToast } = useToast();
    const can = usePermission();

    const module = assignment?.module;
    const course = module?.course;
    const readOnly = !can(Permission.updateCourse, course);

    // Form for the action editor
    const { control } = useAutosaveForm<Partial<Action>>({
        onSave: async (input) => {
            await updateActionsMutation({
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
                    <WebhookIcon />
                </ColoredAvatar>
            }
            assignment={assignment}
            block={block}
            action={action}
            disableMoveUp={disableMoveUp}
            disableMoveDown={disableMoveDown}
            index={index}
        >
            <TextFieldController
                fullWidth
                label={"Url"}
                name="url"
                control={control}
                controllerProps={{
                    rules: {
                        validate: (v) =>
                            isURL(v) ||
                            (t("validationErrorInvalidUrl") as string),
                    },
                }}
                disabled={readOnly}
            />
        </SummaryCardAction>
    );
}
