import AddIcon from "@mui/icons-material/Add";
import IOTestIcon from "@mui/icons-material/CompareArrows";
import {
    Button,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "@mui/material";
import { Permission } from "core";
import { useUpdateAction } from "features/question/staff/Question.data";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Action } from "interface/Action.interface";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { IOTest } from "interface/IOTest.interface";
import { useState } from "react";
import { Flipped, Flipper } from "react-flip-toolkit";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { ColoredAvatar } from "ui/ColoredAvatar";
import { useAutosaveForm } from "ui/form/Autosave";
import { CodeEditorController } from "ui/form/CodeEditorController";
import { SwitchController } from "ui/form/SwitchController";
import { SummaryCardAction } from "../SummaryCardAction";
import { AddIOTestDialog } from "./AddIOTestDialog";
import { EditIOTestDialog } from "./EditIOTestDialog";
import { IOTestMenu } from "./IOTestMenu";

export interface EditActionIOTestProps {
    assignment: Assignment;
    block: Block;
    action: Action;
    disableMoveUp?: boolean;
    disableMoveDown?: boolean;
    index: number;
}

export function EditActionIOTest(props: EditActionIOTestProps) {
    const { assignment, block, action, disableMoveUp, disableMoveDown, index } =
        props;
    const { t } = useTranslation();
    const { showSuccessToast } = useToast();
    const can = usePermission();

    const module = assignment?.module;
    const course = module?.course;
    const readOnly = !can(Permission.updateCourse, course);

    const [addIOTestDialogOpen, setAddIOTestDialogOpen] = useState(false);
    const [editIOTestDialogOpen, setEditIOTestDialogOpen] = useState(false);

    const [selectedIOTest, setSelectedIOTest] = useState<IOTest | null>(null);

    const [updateActionMutation] = useUpdateAction();

    const { control } = useAutosaveForm<Action>({
        defaultValues: {
            ...action,
            answerEmbedding: action.answerEmbedding || "{{answer}}",
        },
        onSave: async (input: Partial<Action>) => {
            await updateActionMutation({
                variables: {
                    id: action.id,
                    input,
                },
            });
            showSuccessToast();
        },
    });

    const tests = action.ioTests || [];
    const flipKey = tests.map((test) => test.id).join("-");

    return (
        <>
            <SummaryCardAction
                title={t(`assignment:actionType_${action.type}`)}
                avatar={
                    <ColoredAvatar>
                        <IOTestIcon />
                    </ColoredAvatar>
                }
                assignment={assignment}
                block={block}
                action={action}
                disableMoveUp={disableMoveUp}
                disableMoveDown={disableMoveDown}
                index={index}
                advanced={
                    <Stack spacing={2} alignItems="flex-start">
                        <Align right>
                            <SwitchController
                                control={control}
                                label={t("assignment:hideFeedback")}
                                labelPlacement="start"
                                name="hideFeedback"
                                disabled={readOnly}
                            />
                        </Align>
                        <CodeEditorController
                            control={control}
                            label={t("assignment:answerEmbedding")}
                            language={block.programmingLanguage}
                            name="answerEmbedding"
                            disabled={readOnly}
                        />
                    </Stack>
                }
            >
                <Flipper flipKey={flipKey}>
                    <Stack alignItems="flex-start" spacing={2}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        {t("assignment:ioTestName")}
                                    </TableCell>
                                    <TableCell>
                                        {t("assignment:ioTestInput")}
                                    </TableCell>
                                    <TableCell>
                                        {t("assignment:ioTestOutput")}
                                    </TableCell>
                                    {!readOnly && (
                                        <TableCell align="center"></TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tests.map((test, index) => (
                                    <Flipped key={test.id} flipId={test.id}>
                                        <TableRow
                                            key={`row_${test?.id}`}
                                            hover={!readOnly}
                                            sx={{
                                                "&:hover": {
                                                    cursor: readOnly
                                                        ? "default"
                                                        : "pointer",
                                                },
                                            }}
                                            onClick={(event) => {
                                                if (readOnly) {
                                                    return null;
                                                }
                                                event.stopPropagation();
                                                setSelectedIOTest(test);
                                                setEditIOTestDialogOpen(true);
                                            }}
                                        >
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                {test.name}
                                            </TableCell>
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                {test.input.replace(
                                                    /(\r\n|\n|\r)/gm,
                                                    " - "
                                                )}
                                            </TableCell>
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                {test.output.replace(
                                                    /(\r\n|\n|\r)/gm,
                                                    " - "
                                                )}
                                            </TableCell>
                                            {!readOnly && (
                                                <TableCell align="right">
                                                    <IOTestMenu
                                                        block={block}
                                                        test={test}
                                                        action={action}
                                                        index={index}
                                                    />
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    </Flipped>
                                ))}
                            </TableBody>
                        </Table>
                        {!readOnly && (
                            <Button
                                startIcon={<AddIcon />}
                                data-cy={`addIOTestButton_${action.id}`}
                                onClick={() => setAddIOTestDialogOpen(true)}
                            >
                                {t("assignment:addIOTest")}
                            </Button>
                        )}
                        {assignment?.hasGrading && (
                            <SwitchController
                                control={control}
                                label={t("assignment:teacherOnly")}
                                labelPlacement="end"
                                name="teacherOnly"
                                disabled={readOnly}
                            />
                        )}
                    </Stack>
                    <AddIOTestDialog
                        block={block}
                        action={action}
                        open={addIOTestDialogOpen}
                        onClose={() => {
                            setAddIOTestDialogOpen(false);
                        }}
                    />
                    <EditIOTestDialog
                        block={block}
                        action={action}
                        testId={selectedIOTest ? selectedIOTest.id : ""}
                        open={editIOTestDialogOpen}
                        onClose={() => {
                            setEditIOTestDialogOpen(false);
                        }}
                    />
                </Flipper>
            </SummaryCardAction>
        </>
    );
}
