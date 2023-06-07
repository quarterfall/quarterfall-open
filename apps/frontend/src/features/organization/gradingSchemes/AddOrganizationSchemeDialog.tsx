import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
} from "@mui/material";
import { ProgrammingLanguage } from "core";
import { useToast } from "hooks/useToast";
import { GradingScheme } from "interface/GradingScheme.interface";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { CodeEditorController } from "ui/form/CodeEditorController";
import { TextFieldController } from "ui/form/TextFieldController";
import { useCreateGradingScheme } from "../api/OrganizationGrading.data";

export interface AddOrganizationSchemeDialogProps {
    open: boolean;
    onClose?: () => void;
}

export const AddOrganizationSchemeDialog = (
    props: AddOrganizationSchemeDialogProps
) => {
    const { open, onClose } = props;
    const { t } = useTranslation();
    const { showSuccessToast } = useToast();
    const [createGradingSchemeMutation] = useCreateGradingScheme();

    const defaultValues = {
        name: "",
        description: "",
        code: "",
    };

    const onSubmit = async (input: Partial<GradingScheme>) => {
        await createGradingSchemeMutation();
        showSuccessToast();
    };

    const {
        control,
        handleSubmit,
        formState: { isValid },
    } = useForm<Partial<GradingScheme>>({
        defaultValues,
        mode: "onChange",
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Dialog open={open} onClose={onClose}>
                <DialogTitle />
                <DialogContent>
                    <Grid container spacing={2} direction="column">
                        <Grid item xs={12}>
                            <TextFieldController
                                control={control}
                                name="name"
                                variant="outlined"
                                required
                                fullWidth
                                multiline
                                label={t("organization:gradingSchemeName")}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextFieldController
                                control={control}
                                name="description"
                                variant="outlined"
                                fullWidth
                                multiline
                                label={t(
                                    "organization:gradingSchemeDescription"
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <CodeEditorController
                                control={control}
                                name="code"
                                label={t("organization:gradingSchemeCode")}
                                required
                                language={ProgrammingLanguage.javascript}
                            />
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
            </Dialog>
        </form>
    );
};
