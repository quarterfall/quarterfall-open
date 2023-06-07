import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Typography,
} from "@mui/material";
import { useAuthContext } from "context/AuthProvider";
import { useImportAssignment } from "features/assignment/staff/api/Assignment.data";
import { Module } from "interface/Module.interface";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TextFieldController } from "ui/form/TextFieldController";
import { WaitingOverlay } from "ui/WaitingOverlay";

export interface ImportAssignmentDialogProps {
    open: boolean;
    module: Module;
    onClose?: () => void;
    onComplete?: (newAssignmentId: string) => void;
}

export function ImportAssignmentDialog(props: ImportAssignmentDialogProps) {
    const { t } = useTranslation();
    const [importAssignmentMutation] = useImportAssignment();
    const [importing, setImporting] = useState(false);
    const { refetch } = useAuthContext();

    const {
        open = false,
        module,
        onClose = () => void 0,
        onComplete = () => void 0,
    } = props;

    // Form for the assignment import
    const {
        control,
        handleSubmit,
        formState: { isValid },
        setError,
    } = useForm<{ code: string }>({
        mode: "onChange",
    });

    const onSubmit = async (input) => {
        try {
            setImporting(true);
            const code = input.code;
            const moduleId = module.id;

            // import the assignment
            const result = await importAssignmentMutation({
                variables: {
                    code,
                    moduleId,
                },
            });

            setImporting(false);

            // refetch the 'me' data to update the assignment list
            await refetch();

            // update the current id to be the new assignment
            const newId = result.data?.importAssignment.id;
            if (newId) {
                onComplete(newId);
            }
            if (onClose) {
                onClose();
            }
        } catch (error) {
            setImporting(false);
            setError("code", { message: t("codeNotFoundError") });
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>
                    {t("assignment:titleImportAssignment")}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} direction="column">
                        <Grid item>
                            <Typography>
                                {t("assignment:bodyImportAssignment")}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <TextFieldController
                                control={control}
                                autoFocus
                                fullWidth
                                label={t("shareCode")}
                                name="code"
                                required
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("cancel")}</Button>
                    <WaitingOverlay waiting={importing}>
                        <Button
                            type="submit"
                            color="primary"
                            key={`${!isValid || importing}`}
                            disabled={!isValid || importing}
                        >
                            {t("continue")}
                        </Button>
                    </WaitingOverlay>
                </DialogActions>
            </form>
        </Dialog>
    );
}
