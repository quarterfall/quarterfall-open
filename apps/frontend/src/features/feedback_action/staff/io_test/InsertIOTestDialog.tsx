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
import { useAddIOTest } from "features/question/staff/Question.data";
import { useToast } from "hooks/useToast";
import { Action } from "interface/Action.interface";
import { Block } from "interface/Block.interface";
import { IOTest } from "interface/IOTest.interface";
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

export interface InsertIOTestDialogProps {
    block: Block;
    action: Action;
    open: boolean;
    beforeIndex: number;
    onClose?: () => void;
}

export function InsertIOTestDialog(props: InsertIOTestDialogProps) {
    const { block, action, open, beforeIndex, onClose } = props;
    const [addIOTestMutation] = useAddIOTest();
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
        return `unitTest${action?.ioTests?.length + 1}`;
    };

    const defaultValues = {
        name: newTestName(),
        description: "",
        input: "",
        output: "",
        comparisonCode: "",
    };

    const onSubmit = async (input: IOTest) => {
        // update the action with the new test list
        setWaiting(true);
        await addIOTestMutation({
            variables: {
                actionId: action.id,
                input,
                beforeIndex,
            },
        });
        setWaiting(false);

        showSuccessToast(
            t("assignment:unitTestInsertedNotification", {
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
        reset,
        formState: { isValid },
    } = useForm<Partial<IOTest>>({
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
            onClick={(event) => {
                event.stopPropagation();
            }}
            TransitionProps={{ onEnter }}
            fullWidth
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{t("assignment:titleInsertIOTest")}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} direction="column">
                        <Grid item>
                            <Typography>
                                {t("assignment:bodyInsertIOTest")}
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
                                                value.includes("return") ||
                                                (t(
                                                    "assignment:ioTestCodeShouldContainReturnValue"
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
                    <Button onClick={() => onClose()}>{t("cancel")}</Button>
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
