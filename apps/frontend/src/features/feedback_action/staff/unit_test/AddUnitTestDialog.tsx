import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Typography,
} from "@mui/material";
import { patterns } from "core";
import { useAddUnitTest } from "features/question/staff/Question.data";
import { useToast } from "hooks/useToast";
import { Action } from "interface/Action.interface";
import { Block } from "interface/Block.interface";
import { UnitTest } from "interface/UnitTest.interface";
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

export interface AddUnitTestDialogProps {
    block: Block;
    action: Action;
    open: boolean;
    onClose?: () => void;
}

export function AddUnitTestDialog(props: AddUnitTestDialogProps) {
    const { block, action, open, onClose } = props;
    const [addUnitTestMutation] = useAddUnitTest();
    const [waiting, setWaiting] = useState(false);

    const { showSuccessToast } = useToast();
    const { t } = useTranslation();

    const newTestName = () => {
        const names = action?.tests?.map((t) => t.name);
        for (let i = 1; i < names?.length + 1; i++) {
            if (names.indexOf(`unitTest${i}`) === -1) {
                return `unitTest${i}`;
            }
        }
        return `unitTest${action?.tests?.length + 1}`;
    };

    const defaultValues = {
        name: newTestName(),
        description: "",
        isCode: false,
        code: "",
    };

    const onSubmit = async (input: UnitTest) => {
        // update the action with the new test list
        setWaiting(true);
        await addUnitTestMutation({
            variables: {
                actionId: action.id,
                input,
            },
        });
        setWaiting(false);
        showSuccessToast(
            t("assignment:unitTestAddedNotification", {
                testName: input.name,
            })
        );
        if (onClose) {
            onClose();
        }
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

    const onEnter = () => {
        // unfortunately, the timeout is needed due to a limitation of
        // react-hook-form and Material-UI dialogs
        setTimeout(() => {
            reset(defaultValues);
        }, 100);
    };

    // Form for the unit test creation
    return (
        <Dialog
            open={open}
            onClose={onClose}
            TransitionProps={{ onEnter }}
            fullWidth
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{t("assignment:titleAddUnitTest")}</DialogTitle>
                <DialogContent style={{ overflow: "hidden" }}>
                    <Grid container spacing={2} direction="column">
                        <Grid item>
                            <Typography>
                                {t("assignment:bodyAddUnitTest")}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <TextFieldController
                                fullWidth
                                label={t("assignment:unitTestName")}
                                name="name"
                                control={control}
                                required
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
                                    label={t("assignment:unitTestIsCodeBlock")}
                                    labelPlacement="start"
                                    name="isCode"
                                    control={control}
                                />
                            </Align>
                        </Grid>
                        <Grid item data-cy={`addUnitTestDialog_code`}>
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
                                            const isCode = getValues(
                                                "isCode"
                                            ) as boolean;
                                            return (
                                                !isCode ||
                                                value.includes("return") ||
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
                    <Button onClick={onClose}>{t("cancel")}</Button>
                    <WaitingOverlay waiting={waiting}>
                        <Button
                            color="primary"
                            type="submit"
                            data-cy={`addUnitTestDialog_submit`}
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
