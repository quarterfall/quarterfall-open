import MoveDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoveUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
} from "@mui/material";
import { useAuthContext } from "context/AuthProvider";
import { ProgrammingLanguage } from "core";
import { useToast } from "hooks/useToast";
import { GradingScheme } from "interface/GradingScheme.interface";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { CodeEditorController } from "ui/form/CodeEditorController";
import { SwitchController } from "ui/form/SwitchController";
import { TextFieldController } from "ui/form/TextFieldController";
import { WaitingOverlay } from "ui/WaitingOverlay";
import { useUpdateGradingScheme } from "../api/OrganizationGrading.data";
import { TestGradingForm } from "./TestGradingForm";

export interface EditOrganizationSchemeDialogProps {
    open: boolean;
    gradingSchemeId: string;
    onClose?: () => void;
}

export const EditOrganizationSchemeDialog = (
    props: EditOrganizationSchemeDialogProps
) => {
    const { open, gradingSchemeId, onClose } = props;
    const { t } = useTranslation();
    const { showSuccessToast } = useToast();
    const { me } = useAuthContext();
    const [waiting, setWaiting] = useState(false);
    const [updateGradingSchemeMutation] = useUpdateGradingScheme();
    const [expanded, setExpanded] = useState(false);

    const gradingScheme = me?.organization?.gradingSchemes.find(
        (s) => s.id === gradingSchemeId
    );

    const defaultValues = {
        name: t(gradingScheme?.name),
        description: t(gradingScheme?.description),
        isDefault: gradingScheme?.isDefault,
        code: gradingScheme?.code,
    };

    const onSubmit = async (input: Partial<GradingScheme>) => {
        setWaiting(true);
        await updateGradingSchemeMutation({
            variables: {
                gradingSchemeId: gradingSchemeId,
                input,
            },
        });
        setWaiting(false);
        showSuccessToast();
        onClose();
    };

    const {
        control,
        handleSubmit,
        formState: { isValid },
        watch,
        reset,
    } = useForm<Partial<GradingScheme>>({
        defaultValues,
        mode: "onChange",
    });

    const onEnter = () => {
        // unfortunately, the timeout is needed due to a limitation of
        // react-hook-form and Material-UI dialogs
        setTimeout(() => {
            reset(defaultValues);
        }, 20);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            onClick={(event) => {
                event.stopPropagation();
            }}
            TransitionProps={{
                onEnter,
            }}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{t("organization:editGradingScheme")}</DialogTitle>
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
                            <SwitchController
                                control={control}
                                name="isDefault"
                                label={t("organization:gradingSchemeDefault")}
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
                        <Grid item xs={12}>
                            <Align left>
                                <Button
                                    onClick={() => setExpanded(!expanded)}
                                    endIcon={
                                        expanded ? (
                                            <MoveUpIcon />
                                        ) : (
                                            <MoveDownIcon />
                                        )
                                    }
                                    disabled={!isValid}
                                >
                                    {expanded ? t("hideTest") : t("showTest")}
                                </Button>
                            </Align>
                        </Grid>
                        {expanded && (
                            <Grid item xs={12}>
                                <TestGradingForm
                                    gradingScheme={{
                                        code: watch("code"),
                                    }}
                                />
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("cancel")}</Button>
                    <WaitingOverlay waiting={waiting}>
                        <Button
                            type="submit"
                            color="primary"
                            key={`${!isValid}`}
                            disabled={!isValid || waiting}
                        >
                            {t("continue")}
                        </Button>
                    </WaitingOverlay>
                </DialogActions>
            </form>
        </Dialog>
    );
};
