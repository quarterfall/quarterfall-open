import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Typography,
} from "@mui/material";
import { useToast } from "hooks/useToast";
import { Block } from "interface/Block.interface";
import { File } from "interface/File.interface";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TextFieldController } from "ui/form/TextFieldController";
import { useUpdateSubmissionFile } from "../../assignment/student/Assignment.data";

export interface EditSubmissionFileDialogProps {
    block: Block;
    file: File;
    open: boolean;
    onClose?: () => void;
}

export function EditSubmissionFileDialog(props: EditSubmissionFileDialogProps) {
    const { block, file, open, onClose } = props;
    const [updateSubmissionFileMutation] = useUpdateSubmissionFile();
    const { showSuccessToast } = useToast();
    const { t } = useTranslation();

    const onSubmit = async (input) => {
        // update the assignment
        await updateSubmissionFileMutation({
            variables: {
                blockId: block?.id,
                fileId: file?.id,
                input,
            },
        });
        showSuccessToast();
        if (onClose) {
            onClose();
        }
    };
    // Form for the unit test creation
    const {
        control,
        handleSubmit,
        formState: { isValid },
        reset,
    } = useForm<{ label: string }>({
        mode: "onChange",
        defaultValues: { label: file?.label },
    });

    useEffect(() => reset({ label: file?.label }), [file]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>
                    {t("assignment:titleEditAssignmentFile")}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} direction="column">
                        <Grid item>
                            <Typography>
                                {t("assignment:bodyEditAssignmentFile")}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <TextFieldController
                                control={control}
                                fullWidth
                                autoFocus
                                label={t("assignment:fileLabel")}
                                name="label"
                                required
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("cancel")}</Button>
                    <Button color="primary" disabled={!isValid} type="submit">
                        {t("continue")}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
