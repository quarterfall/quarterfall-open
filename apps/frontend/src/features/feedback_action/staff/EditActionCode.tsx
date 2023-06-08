import { Monaco } from "@monaco-editor/react";
import CodeIcon from "@mui/icons-material/Computer";
import { Permission } from "core";
import { useUpdateAction } from "features/question/staff/Question.data";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Action } from "interface/Action.interface";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { editor } from "monaco-editor";
import { useTranslation } from "react-i18next";
import { ColoredAvatar } from "ui/ColoredAvatar";
import { useAutosaveForm } from "ui/form/Autosave";
import { CodeEditorController } from "ui/form/CodeEditorController";
import { SummaryCardAction } from "./SummaryCardAction";

const qfTyping = `
    declare interface Qf {
        /** The number of times that the student has requested feedback until now, including this time. */
        attemptCount: number;

        /** The list of feedback that has been generated until now. */
        feedback: string[];

        /** The score that was computed for this question. */
        score: number;

        /** Whether the next feedback blocks should still be run. */
        stop: boolean;

        /** Information about the student answering the question. */
        user: {
            /** Id of the student. */
            id: string;

            /** First name of the student */
            firstName: string;

            /** Last name of the student */
            lastName: string;

            /** Preferred language of the student */
            language: string;
        };
        assignment: {
            /** Id of the assignment. */
            id: string;

            /** Title of this assignment. */
            title: string;
        };
        question: {
            /** Id of the question. */
            id: string;

            /** Text of the question. */
            text: string;

            /** The solution to this question. */
            solution: string;

            /** The programming language used in this question (for code questions). */
            programmingLanguage?: string;

            /** The labels of the choices that are correct (for MCQ). */
            correctChoices?: string[];
        };
        /** Array containing the answers given by the student. */
        answers: string[];

        /** The answer given by the student (this is the same as qf.answers[0])
        answer: string;

        /** Whether the question was answered correctly. */
        correct?: boolean;
        /** The number of answers provided by the student. */
        answerCount?: number
        /** The number of answers the student had correct. */
        correctAnswerCount?: number;
        /** The number of answers the student had wrong. */
        wrongAnswerCount?: number;
        /** The correct answers the student gave. */
        correctAnswers?: string[];
        /** The wrong answers the student gave. */
        wrongAnswers?: string[];

        /** The result of the database query (for database questions only). */
        dbQueryResult?: any[][];
        /** The raw output of the database query (for database questions only). */
        dbQueryResultRaw?: any;
        /** Database inspector object (for database questions only). */
        dbInspector?: any;

        /** How many unit tests passed (for unit test feedback blocks only). */
        successfulTestCount?: number;

        /** How many unit tests failed (for unit test feedback blocks only). */
        failedTestCount?: number;
    }
    
    declare const qf: Qf;
    `;

export interface EditActionCodeProps {
    assignment: Assignment;
    block: Block;
    action: Action;
    disableMoveUp?: boolean;
    disableMoveDown?: boolean;
    index: number;
}

export function EditActionCode(props: EditActionCodeProps) {
    const { assignment, block, action, disableMoveUp, disableMoveDown, index } =
        props;
    const [updateActionMutation] = useUpdateAction();
    const { t } = useTranslation();
    const { showSuccessToast } = useToast();
    const can = usePermission();

    const module = assignment?.module;
    const course = module?.course;
    const readOnly = !can(Permission.updateCourse, course);

    const { control } = useAutosaveForm<Action>({
        defaultValues: action,
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

    const onMonacoEditorMount = (
        editor: editor.IStandaloneCodeEditor,
        monaco: Monaco
    ) => {
        monaco.languages.typescript.javascriptDefaults.addExtraLib(
            qfTyping,
            "filename/facts.d.ts"
        );
    };

    return (
        <SummaryCardAction
            title={t(`assignment:actionType_${action.type}`)}
            avatar={
                <ColoredAvatar>
                    <CodeIcon />
                </ColoredAvatar>
            }
            assignment={assignment}
            block={block}
            action={action}
            disableMoveUp={disableMoveUp}
            disableMoveDown={disableMoveDown}
            index={index}
        >
            <CodeEditorController
                name="code"
                control={control}
                onMount={onMonacoEditorMount}
                label={t("assignment:actionCode")}
                language="javascript"
                disabled={readOnly}
            />
        </SummaryCardAction>
    );
}
