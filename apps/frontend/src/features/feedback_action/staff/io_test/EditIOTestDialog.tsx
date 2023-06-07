import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Typography,
} from "@mui/material";
import { IOTest, patterns } from "core";
import { useUpdateIOTest } from "features/question/staff/Question.data";
import { useToast } from "hooks/useToast";
import { Action } from "interface/Action.interface";
import { Block } from "interface/Block.interface";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { CodeEditorController } from "ui/form/CodeEditorController";
import { TextFieldController } from "ui/form/TextFieldController";
import { WaitingOverlay } from "ui/WaitingOverlay";
const MarkdownFieldController = dynamic(() =>
    import("ui/form/MarkdownFieldController").then(
        (mod) => mod.MarkdownFieldController
    )
);

export interface EditIOTestDialogProps {
    block: Block;
    testId: string;
    action: Action;
    open: boolean;
    onClose?: () => void;
}

export function EditIOTestDialog(props: EditIOTestDialogProps) {
    const { block, testId, action, open, onClose } = props;
    const [updateIOTestMutation] = useUpdateIOTest();
    const [waiting, setWaiting] = useState(false);

    const { showSuccessToast } = useToast();
    const { t } = useTranslation();
    const test = (action.ioTests || []).find((tst) => tst.id === testId);

    const defaultValues = {
        name: test?.name || "",
        description: test?.description || "",
        input: test?.input || "",
        output: test?.output || "",
        comparisonCode: test?.comparisonCode || "",
    };

    const {
        control,
        handleSubmit,
        reset,
        formState: { isValid, isDirty },
    } = useForm<Partial<IOTest>>({
        defaultValues,
        mode: "onChange",
    });

    const onSubmit = async (input) => {
        if (!test) {
            return;
        }
        setWaiting(true);
        // update the action with the new test list
        await updateIOTestMutation({
            variables: {
                id: testId,
                actionId: action.id,
                input,
            },
        });
        setWaiting(false);
        showSuccessToast(
            t("assignment:unitTestUpdatedNotification", {
                testName: test ? test.name : "",
            })
        );
        if (onClose) {
            onClose();
        }
    };

    const onEnter = () => {
        // unfortunately, the timeout is needed due to a limitation of
        // react-hook-form and Material-UI dialogs
        setTimeout(() => {
            reset(defaultValues);
        }, 100);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            onClick={(event) => {
                event.stopPropagation();
            }}
            TransitionProps={{ onEnter }}
            fullWidth
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{t("assignment:titleEditIOTest")}</DialogTitle>
                <DialogContent style={{ overflow: "hidden" }}>
                    <Grid container spacing={2} direction="column">
                        <Grid item>
                            <Typography>
                                {t("assignment:bodyEditIOTest")}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <TextFieldController
                                fullWidth
                                label={t("assignment:unitTestName")}
                                name="name"
                                control={control}
                                required
                                variant="outlined"
                                controllerProps={{
                                    rules: {
                                        pattern: {
                                            value: patterns.variable,
                                            message: t(
                                                "validationErrorInvalidVariableName"
                                            ),
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item>
                            <MarkdownFieldController
                                fullWidth
                                label={t("assignment:unitTestDescription")}
                                name="description"
                                control={control}
                            />
                        </Grid>
                        <Grid item>
                            <MarkdownFieldController
                                fullWidth
                                label={t("assignment:ioTestInput")}
                                name="input"
                                control={control}
                                multiline
                                minRows={3}
                            />
                        </Grid>
                        <Grid item>
                            <MarkdownFieldController
                                fullWidth
                                label={t("assignment:ioTestOutput")}
                                name="output"
                                control={control}
                                required
                                multiline
                                minRows={3}
                            />
                        </Grid>

                        <Grid item>
                            <CodeEditorController
                                label={t("assignment:ioTestCode")}
                                language={block.programmingLanguage}
                                name="comparisonCode"
                                control={control}
                                autoFocus={true}
                                controllerProps={{
                                    rules: {
                                        validate: (value: string) => {
                                            return (
                                                Boolean(
                                                    value.includes("return")
                                                ) ||
                                                (t(
                                                    "assignment:unitTestCodeShouldContainReturnValue"
                                                ) as string)
                                            );
                                        },
                                    },
                                }}
                                required
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            onClose();
                        }}
                    >
                        {t("cancel")}
                    </Button>
                    <WaitingOverlay waiting={waiting}>
                        <Button
                            color="primary"
                            type="submit"
                            disabled={waiting || !isValid || !isDirty}
                        >
                            {t("continue")}
                        </Button>
                    </WaitingOverlay>
                </DialogActions>
            </form>
        </Dialog>
    );
}
