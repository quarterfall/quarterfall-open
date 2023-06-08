import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Typography,
} from "@mui/material";
import { useUpdateBlock } from "features/assignment/staff/api/Assignment.data";
import { Block } from "interface/Block.interface";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TextFieldController } from "ui/form/TextFieldController";

export interface EditPartTitleDialogProps {
    block: Block;
    open: boolean;
    onClose?: () => void;
}

export function EditQuestionTitleDialog(props: EditPartTitleDialogProps) {
    const { t } = useTranslation();
    const [updateBlockMutation] = useUpdateBlock();

    const { open, onClose, block } = props;

    const {
        control,
        reset,
        handleSubmit,
        formState: { isValid, isDirty },
    } = useForm({
        mode: "onChange",
    });

    const onSubmit = async (input: Block) => {
        await updateBlockMutation({
            variables: {
                id: block.id,
                input,
            },
        });
    };

    const onCancel = () => {
        onClose();
        reset();
    };

    useEffect(() => {
        reset({
            title: `${
                block.title || `${t("assignment:question")} ${block.index + 1}`
            }`,
        });
    }, [block.id]);

    return (
        <Dialog open={open} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{t("assignment:editQuestionTitle")}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} direction="column">
                        <Grid item xs={12} style={{ minWidth: 500 }}>
                            <Typography>
                                {t("assignment:editQuestionTitleText")}
                            </Typography>
                        </Grid>
                        {/* Question title */}
                        <Grid item xs={12}>
                            <TextFieldController
                                control={control}
                                autoFocus
                                name="title"
                                label={t("assignment:questionTitle")}
                                variant="outlined"
                                fullWidth
                                required
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCancel}>{t("cancel")}</Button>
                    <Button
                        type="submit"
                        color="primary"
                        onClick={onClose}
                        key={`${!isValid || !isDirty}`}
                        disabled={!isValid || !isDirty}
                    >
                        {t("continue")}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
