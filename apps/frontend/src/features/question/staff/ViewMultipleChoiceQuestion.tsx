import {
    alpha,
    Checkbox,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Radio,
    Stack,
} from "@mui/material";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { Choice } from "interface/Choice.interface";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));

interface ViewMultipleChoiceQuestionProps {
    assignment: Assignment;
    block: Block;
    answer?: string[];
    onUpdateAnswer?: (answer: string[]) => void;
    showQuestionText?: boolean;
    showAnswer?: boolean;
    showSolution?: boolean;
    readOnly?: boolean;
    isPreview?: boolean;
}

export function ViewMultipleChoiceQuestion(
    props: ViewMultipleChoiceQuestionProps
) {
    const {
        assignment,
        block,
        readOnly,
        isPreview,
        showQuestionText,
        showAnswer,
        showSolution,
        onUpdateAnswer = (_: string[]) => void 0,
    } = props;
    const [answer, setAnswer] = useState<string[]>(props.answer || []);

    // if the block id changes, reset the answers
    useEffect(() => {
        setAnswer(props.answer || []);
    }, [block.id]);

    // if the block contents changed, we need to clear
    useEffect(() => {
        if (!isPreview) {
            return;
        }
        // clear the answer if the block is not multiple correct and we selected more than one option
        if (!block.multipleCorrect && answer.length > 1) {
            setAnswer([]);
        }
        // verify that each answer is still a valid choice
        const choiceIds = (block.choices || []).map((c) => c.id);
        if (!answer.every((a) => choiceIds.indexOf(a) >= 0)) {
            setAnswer([]);
        }
    }, [block]);

    const handleChangeAnswer = (choice: Choice) => {
        if (readOnly) {
            return;
        }
        if (!block.multipleCorrect) {
            setAnswer([choice.id]);
            onUpdateAnswer([choice.id]);
        } else {
            const newAnswer =
                answer.indexOf(choice.id) >= 0
                    ? answer.filter((a) => a !== choice.id)
                    : answer.concat(choice.id);
            setAnswer(newAnswer);
            onUpdateAnswer(newAnswer);
        }
    };

    return (
        <Stack spacing={1}>
            {/* Question text */}
            {block.text && showQuestionText && (
                <Markdown files={assignment.files}>{block.text}</Markdown>
            )}
            {/* Question choices */}
            <List>
                {(block.choices || []).map((choice, index: number) => (
                    <ListItem
                        key={`choice_${choice.id}`}
                        disableGutters
                        button={
                            !readOnly && !block.completed ? true : undefined
                        }
                        onClick={() => handleChangeAnswer(choice)}
                        sx={{
                            borderRadius: (theme) =>
                                `${theme.shape.borderRadius}px !important`,
                            ...(showSolution && {
                                backgroundColor: (theme) =>
                                    alpha(theme.palette.success.main, 0.1),
                            }),
                        }}
                    >
                        <ListItemIcon>
                            {!block.multipleCorrect && (
                                <Radio
                                    disabled={readOnly}
                                    color="primary"
                                    checked={
                                        (!readOnly || showAnswer) &&
                                        answer.indexOf(choice.id) >= 0
                                    }
                                />
                            )}
                            {block.multipleCorrect && (
                                <Checkbox
                                    disabled={readOnly}
                                    color="primary"
                                    checked={
                                        (!readOnly || showAnswer) &&
                                        answer.indexOf(choice.id) >= 0
                                    }
                                />
                            )}
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Markdown dense files={assignment.files}>
                                    {choice.text}
                                </Markdown>
                            }
                        />
                    </ListItem>
                ))}
            </List>
        </Stack>
    );
}
