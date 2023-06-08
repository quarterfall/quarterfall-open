import AddIcon from "@mui/icons-material/Add";
import UnitTestIcon from "@mui/icons-material/PlaylistAddCheck";
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
import { UnitTest } from "interface/UnitTest.interface";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Flipped, Flipper } from "react-flip-toolkit";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { ColoredAvatar } from "ui/ColoredAvatar";
import { useAutosaveForm } from "ui/form/Autosave";
import { CodeEditorController } from "ui/form/CodeEditorController";
import { SwitchController } from "ui/form/SwitchController";
import { SummaryCardAction } from "../SummaryCardAction";
import { AddUnitTestDialog } from "./AddUnitTestDialog";
import { EditUnitTestDialog } from "./EditUnitTestDialog";
import { UnitTestMenu } from "./UnitTestMenu";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));

export interface EditActionUnitTestProps {
    assignment: Assignment;
    block: Block;
    action: Action;
    disableMoveUp?: boolean;
    disableMoveDown?: boolean;
    index: number;
}

export function EditActionUnitTest(props: EditActionUnitTestProps) {
    const { assignment, block, action, disableMoveUp, disableMoveDown, index } =
        props;
    const { t } = useTranslation();
    const { showSuccessToast } = useToast();
    const can = usePermission();

    const module = assignment?.module;
    const course = module?.course;
    const readOnly = !can(Permission.updateCourse, course);

    const [addUnitTestDialogOpen, setAddUnitTestDialogOpen] = useState(false);
    const [editUnitTestDialogOpen, setEditUnitTestDialogOpen] = useState(false);

    const [selectedUnitTest, setSelectedUnitTest] = useState<UnitTest | null>(
        null
    );

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

    const tests = action.tests || [];
    const flipKey = tests.map((test) => test.id).join("-");

    return (
        <>
            <SummaryCardAction
                title={t(`assignment:actionType_${action.type}`)}
                avatar={
                    <ColoredAvatar>
                        <UnitTestIcon />
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
                            label={t("assignment:unitTestImports")}
                            language={block.programmingLanguage}
                            name="imports"
                            disabled={readOnly}
                        />
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
                                        {t("assignment:unitTestName")}
                                    </TableCell>
                                    <TableCell>
                                        {t("assignment:unitTestDescription")}
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
                                                setSelectedUnitTest(test);
                                                setEditUnitTestDialogOpen(true);
                                            }}
                                        >
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                {test.name}
                                            </TableCell>
                                            <TableCell>
                                                <Markdown
                                                    dense
                                                    files={assignment.files}
                                                >
                                                    {test.isCode
                                                        ? test.description ||
                                                          test.name
                                                        : test.description ||
                                                          `\`${test.code}\``}
                                                </Markdown>
                                            </TableCell>
                                            {!readOnly && (
                                                <TableCell align="right">
                                                    <UnitTestMenu
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
                                data-cy={`addUnitTestButton_${action.id}`}
                                onClick={() => setAddUnitTestDialogOpen(true)}
                            >
                                {t("assignment:addUnitTest")}
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
                    <AddUnitTestDialog
                        block={block}
                        action={action}
                        open={addUnitTestDialogOpen}
                        onClose={() => {
                            setAddUnitTestDialogOpen(false);
                        }}
                    />
                    <EditUnitTestDialog
                        block={block}
                        action={action}
                        testId={selectedUnitTest ? selectedUnitTest.id : ""}
                        open={editUnitTestDialogOpen}
                        onClose={() => {
                            setEditUnitTestDialogOpen(false);
                        }}
                    />
                </Flipper>
            </SummaryCardAction>
        </>
    );
}
