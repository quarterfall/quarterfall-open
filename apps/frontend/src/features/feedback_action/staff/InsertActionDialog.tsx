import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
    Typography,
} from "@mui/material";
import {
    ActionType,
    AssessmentType,
    BlockType,
    ProgrammingLanguage,
    supportedLanguagesIOTesting,
    supportedLanguagesUnitTesting,
} from "core";
import { useAddAction } from "features/question/staff/Question.data";
import { Action } from "interface/Action.interface";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SelectController } from "ui/form/SelectController";

export interface InsertActionDialogProps {
    assignment: Assignment;
    block: Block;
    open: boolean;
    beforeIndex?: number;
    onClose?: () => void;
}

export const InsertActionDialog = (props: InsertActionDialogProps) => {
    const { assignment, block, beforeIndex, open, onClose } = props;
    const { t } = useTranslation();
    const [addActionMutation] = useAddAction();

    const availableActions: ActionType[] = [
        assignment.assessmentType === AssessmentType.teacher &&
            ActionType.Scoring,
        ActionType.Feedback,
        ActionType.Code,
        ActionType.CloudCheck,
        ActionType.Webhook,
    ].filter(Boolean);

    // add actions specific to code questions
    if (block.type === BlockType.CodeQuestion) {
        // unit test action
        if (
            supportedLanguagesUnitTesting.indexOf(block.programmingLanguage) >=
            0
        ) {
            availableActions.push(ActionType.UnitTest);
        }
        // io test action
        if (
            supportedLanguagesIOTesting.indexOf(block.programmingLanguage) >= 0
        ) {
            availableActions.push(ActionType.IOTest);
        }
        // database action
        if (block.programmingLanguage === ProgrammingLanguage.sql) {
            availableActions.push(ActionType.Database);
        }
    } else if (block.type === BlockType.DatabaseQuestion) {
        // database action
        availableActions.push(ActionType.Database);
    }

    const onSubmit = async (input: Partial<Action>) => {
        const type = input.type;
        await addActionMutation({
            variables: {
                blockId: block.id,
                type,
                teacherOnly:
                    assignment?.hasGrading &&
                    assignment.assessmentType === AssessmentType.teacher,
                beforeIndex,
            },
        });

        if (onClose) {
            onClose();
        }
    };

    const {
        control,
        handleSubmit,
        formState: { isValid },
    } = useForm<{ type: ActionType }>({
        mode: "onChange",
        defaultValues: {
            type: availableActions[0],
        },
    });

    return (
        <Dialog open={open} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{t("assignment:titleInsertAction")}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} direction="column">
                        <Grid item>
                            <Typography>
                                {t("assignment:bodyInsertAction")}
                            </Typography>
                        </Grid>
                        {/* Content type input */}
                        <Grid item>
                            <SelectController
                                control={control}
                                fullWidth
                                variant="outlined"
                                label={t("assignment:actionTypeLabel")}
                                name="type"
                            >
                                {availableActions.map((type) => (
                                    <MenuItem
                                        key={`actionType_${type}`}
                                        value={type}
                                    >
                                        {t(`assignment:actionType_${type}`)}
                                    </MenuItem>
                                ))}
                            </SelectController>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("cancel")}</Button>
                    <Button
                        type="submit"
                        color="primary"
                        key={`${!isValid}`}
                        disabled={!isValid}
                    >
                        {t("continue")}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
