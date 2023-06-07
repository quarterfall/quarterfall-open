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
import { BlockType } from "core";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SelectController } from "ui/form/SelectController";
import { useNavigation } from "ui/route/Navigation";
import { useAddBlock } from "../../../assignment/staff/api/Assignment.data";

export interface InsertBlockDialogProps {
    assignment: Assignment;
    beforeBlock: Block;
    open: boolean;
    onClose?: () => void;
}

export function InsertQuestionDialog(props: InsertBlockDialogProps) {
    const { t } = useTranslation();
    const router = useNavigation();

    const [addBlockMutation] = useAddBlock();

    const { open, onClose, assignment, beforeBlock } = props;

    const allowedBlocks: BlockType[] = [
        BlockType.Text,
        BlockType.CodeQuestion,
        BlockType.OpenQuestion,
        BlockType.MultipleChoiceQuestion,
        BlockType.DatabaseQuestion,
        BlockType.FileUploadQuestion,
    ].filter(Boolean);

    const onSubmit = async (input) => {
        const assignmentId = assignment.id;
        const currentBlocks = assignment.blocks;
        const results = await addBlockMutation({
            variables: {
                input,
                assignmentId,
                beforeIndex: beforeBlock.index,
            },
        });
        const updatedBlocks = results.data.addBlock.blocks;
        if (updatedBlocks.length === currentBlocks.length + 1) {
            router.push(
                `/assignment/${assignmentId}/questions/${
                    updatedBlocks[beforeBlock.index].id
                }`
            );
        }

        if (onClose) {
            onClose();
        }
    };

    // Form for the assignment creation
    const {
        control,
        handleSubmit,
        formState: { isValid },
    } = useForm<{ type: BlockType }>({
        mode: "onChange",
        defaultValues: {
            type: allowedBlocks[0],
        },
    });

    return (
        <Dialog open={open} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{t("assignment:titleInsertQuestion")}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} direction="column">
                        <Grid item>
                            <Typography>
                                {t("assignment:bodyInsertQuestion")}
                            </Typography>
                        </Grid>
                        {/* Content type input */}
                        <Grid item>
                            <SelectController
                                control={control}
                                fullWidth
                                variant="outlined"
                                label={t("assignment:questionTypeLabel")}
                                name="type"
                                required
                            >
                                {allowedBlocks.map((type) => (
                                    <MenuItem
                                        key={`blockType_${type}`}
                                        value={type}
                                    >
                                        {t(`assignment:blockType_${type}`)}
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
}
