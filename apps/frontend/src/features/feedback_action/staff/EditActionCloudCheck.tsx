import CloudCheckIcon from "@mui/icons-material/CloudDone";
import { Alert, Grid } from "@mui/material";
import { patterns, Permission } from "core";
import { useUpdateAction } from "features/question/staff/Question.data";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Action } from "interface/Action.interface";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { useTranslation } from "react-i18next";
import { ColoredAvatar } from "ui/ColoredAvatar";
import { useAutosaveForm } from "ui/form/Autosave";
import { SwitchController } from "ui/form/SwitchController";
import { TextFieldController } from "ui/form/TextFieldController";
import { SummaryCardAction } from "./SummaryCardAction";

export interface EditActionCloudCheckProps {
    assignment: Assignment;
    block: Block;
    action: Action;
    index: number;
    disableMoveUp?: boolean;
    disableMoveDown?: boolean;
}

export function EditActionCloudCheck(props: EditActionCloudCheckProps) {
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
                    <CloudCheckIcon />
                </ColoredAvatar>
            }
            assignment={assignment}
            block={block}
            action={action}
            disableMoveUp={disableMoveUp}
            disableMoveDown={disableMoveDown}
            index={index}
            advanced={
                <Grid container spacing={2} direction="column">
                    <Grid item>
                        <TextFieldController
                            control={control}
                            fullWidth
                            label={t("assignment:gitBranch")}
                            name="gitBranch"
                            disabled={readOnly}
                        />
                    </Grid>
                    <Grid item>
                        <TextFieldController
                            control={control}
                            fullWidth
                            label={t("assignment:gitPath")}
                            name="path"
                            disabled={readOnly}
                        />
                    </Grid>
                    <Grid item>
                        <TextFieldController
                            control={control}
                            fullWidth
                            multiline
                            minRows={3}
                            maxRows={8}
                            label={t("assignment:gitPrivateKey")}
                            name="gitPrivateKey"
                            disabled={readOnly}
                        />
                    </Grid>
                    <Grid item>
                        <Alert severity="info">
                            {t("assignment:cloudcheckCacheInfo")}
                        </Alert>
                    </Grid>
                    <Grid item>
                        <SwitchController
                            control={control}
                            name="forceOverrideCache"
                            disabled={readOnly}
                            label={t("assignment:overrideCloudcheckCache")}
                        />
                    </Grid>
                </Grid>
            }
        >
            <Grid container direction="column" spacing={2}>
                <Grid item>
                    <TextFieldController
                        control={control}
                        fullWidth
                        label={t("assignment:gitUrl")}
                        name="gitUrl"
                        required
                        controllerProps={{
                            rules: {
                                pattern: {
                                    value: patterns.github,
                                    message: t("assignment:gitUrlInvalid"),
                                },
                            },
                        }}
                        disabled={readOnly}
                    />
                </Grid>
            </Grid>
        </SummaryCardAction>
    );
}
