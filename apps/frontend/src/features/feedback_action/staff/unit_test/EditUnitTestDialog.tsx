import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Typography,
} from "@mui/material";
import { patterns, UnitTest } from "core";
import { useUpdateUnitTest } from "features/question/staff/Question.data";
import { useToast } from "hooks/useToast";
import { Action } from "interface/Action.interface";
import { Block } from "interface/Block.interface";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { CodeEditorController } from "ui/form/CodeEditorController";
import { SwitchController } from "ui/form/SwitchController";
import { TextFieldController } from "ui/form/TextFieldController";
import { WaitingOverlay } from "ui/WaitingOverlay";

const MarkdownFieldController = dynamic(() =>
    import("ui/form/MarkdownFieldController").then(
        (mod) => mod.MarkdownFieldController
    )
);

export interface EditUnitTestDialogProps {
    block: Block;
    testId: string;
    action: Action;
    open: boolean;
    onClose?: () => void;
}

export function EditUnitTestDialog(props: EditUnitTestDialogProps) {
    const { block, testId, action, open, onClose } = props;
    const [updateUnitTestMutation] = useUpdateUnitTest();
    const [waiting, setWaiting] = useState(false);

    const { showSuccessToast } = useToast();
    const { t } = useTranslation();
    const test = (action.tests || []).find((tst) => tst.id === testId);

    const defaultValues = {
        name: test?.name || "",
        description: test?.description || "",
        code: test?.code || "",
        isCode: test?.isCode || false,
    };

    const {
        control,
        handleSubmit,
        getValues,
        reset,
        watch,
        formState: { isValid },
    } = useForm<Partial<UnitTest>>({
        defaultValues,
        mode: "onChange",
    });

    const onSubmit = async (input) => {
        if (!test) {
            return;
        }
        setWaiting(true);
        // update the action with the new test list
        await updateUnitTestMutation({
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
                <DialogTitle>{t("assignment:titleEditUnitTest")}</DialogTitle>
                <DialogContent style={{ overflow: "hidden" }}>
                    <Grid container spacing={2} direction="column">
                        <Grid item>
                            <Typography>
                                {t("assignment:bodyEditUnitTest")}
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
                            <Align right>
                                <SwitchController
                                    color="primary"
                                    name="isCode"
                                    label={t("assignment:unitTestIsCodeBlock")}
                                    labelPlacement="start"
                                    control={control}
                                />
                            </Align>
                        </Grid>
                        <Grid item>
                            <CodeEditorController
                                label={
                                    watch("isCode") === true
                                        ? t("assignment:unitTestCode")
                                        : t("assignment:unitTestExpression")
                                }
                                language={block.programmingLanguage}
                                name="code"
                                control={control}
                                autoFocus={true}
                                controllerProps={{
                                    rules: {
                                        validate: (value: string) => {
                                            const isCode = getValues("isCode");
                                            return (
                                                Boolean(
                                                    !isCode ||
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
                            disabled={waiting || !isValid}
                        >
                            {t("continue")}
                        </Button>
                    </WaitingOverlay>
                </DialogActions>
            </form>
        </Dialog>
    );
}
