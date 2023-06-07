import DatabaseIcon from "@mui/icons-material/Storage";
import { Grid, MenuItem } from "@mui/material";
import { DatabaseDialect, Permission, ProgrammingLanguage } from "core";
import { useUpdateAction } from "features/question/staff/Question.data";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Action } from "interface/Action.interface";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { ColoredAvatar } from "ui/ColoredAvatar";
import { useAutosaveForm } from "ui/form/Autosave";
import { CodeEditorController } from "ui/form/CodeEditorController";
import { SelectController } from "ui/form/SelectController";
import { SwitchController } from "ui/form/SwitchController";
import { SummaryCardAction } from "./SummaryCardAction";

export interface EditActionDatabaseProps {
    assignment: Assignment;
    block: Block;
    action: Action;
    disableMoveUp?: boolean;
    disableMoveDown?: boolean;
    index: number;
}

export function EditActionDatabase(props: EditActionDatabaseProps) {
    const { assignment, block, action, disableMoveUp, disableMoveDown, index } =
        props;
    const [updateActionMutation] = useUpdateAction();
    const { t } = useTranslation();
    const { showSuccessToast } = useToast();
    const can = usePermission();

    const module = assignment?.module;
    const course = module?.course;
    const readOnly = !can(Permission.updateCourse, course);

    const { control } = useAutosaveForm<Action>({
        defaultValues: {
            ...action,
            answerEmbedding: action.answerEmbedding || "{{answer}}",
            databaseDialect: action.databaseDialect || DatabaseDialect.mysql,
        },
        onSave: async (input: Partial<Action>) => {
            await updateActionMutation({
                variables: {
                    id: action.id,
                    input,
                },
            });
            showSuccessToast();
        },
    });

    const files = (assignment.files || []).filter(
        (f) => f.extension === ".sql"
    );

    return (
        <SummaryCardAction
            title={t(`assignment:actionType_${action.type}`)}
            avatar={
                <ColoredAvatar>
                    <DatabaseIcon />
                </ColoredAvatar>
            }
            assignment={assignment}
            block={block}
            action={action}
            disableMoveUp={disableMoveUp}
            disableMoveDown={disableMoveDown}
            index={index}
        >
            <Grid container spacing={2} direction="column">
                <Grid item>
                    <SelectController
                        style={{ minWidth: 200 }}
                        label={t("assignment:databaseFileLabel")}
                        name="databaseFileLabel"
                        variant="outlined"
                        control={control}
                        displayEmpty
                        disabled={files.length === 0}
                    >
                        <MenuItem value="">
                            <i>{t("selectEmpty")}</i>
                        </MenuItem>
                        {files.map((file) => {
                            return (
                                <MenuItem key={file.id} value={file.label}>
                                    {file.label}
                                </MenuItem>
                            );
                        })}
                    </SelectController>
                </Grid>
                <Grid item>
                    <CodeEditorController
                        label={t("assignment:answerEmbedding")}
                        language={ProgrammingLanguage.sql}
                        name="answerEmbedding"
                        control={control}
                        disabled={readOnly}
                    />
                </Grid>
                <Grid item>
                    <SelectController
                        style={{ minWidth: 200 }}
                        label={t("assignment:databaseDialect")}
                        name="databaseDialect"
                        variant="outlined"
                        control={control}
                        disabled={readOnly}
                    >
                        {Object.keys(DatabaseDialect).map((key) => {
                            return (
                                <MenuItem
                                    key={key}
                                    value={DatabaseDialect[key]}
                                >
                                    {t(
                                        `assignment:databaseDialect_${DatabaseDialect[key]}`
                                    )}
                                </MenuItem>
                            );
                        })}
                    </SelectController>
                </Grid>
                {assignment?.hasGrading && (
                    <Grid item>
                        <SwitchController
                            control={control}
                            label={t("assignment:teacherOnly")}
                            labelPlacement="end"
                            name="teacherOnly"
                            disabled={readOnly}
                        />
                    </Grid>
                )}
                <Grid item>
                    <Align right>
                        <SwitchController
                            control={control}
                            label={t("assignment:hideFeedback")}
                            labelPlacement="start"
                            name="hideFeedback"
                            disabled={readOnly}
                        />
                    </Align>
                </Grid>
            </Grid>
        </SummaryCardAction>
    );
}
