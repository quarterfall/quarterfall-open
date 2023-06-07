import {
    alpha,
    CardHeader,
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
import dynamic from "next/dynamic";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));

export interface ViewSubmissionMultipleChoiceQuestionProps {
    assignment: Assignment;
    block: Block;
}

export const ViewSubmissionMultipleChoiceQuestion = (
    props: ViewSubmissionMultipleChoiceQuestionProps
) => {
    const { assignment, block } = props;

    return (
        <Stack spacing={1}>
            {block.text && (
                <CardHeader
                    title={
                        <Markdown files={assignment.files}>
                            {block.text}
                        </Markdown>
                    }
                    style={{ padding: 0 }}
                />
            )}

            <List>
                {(block.choices || []).map((choice, index: number) => (
                    <ListItem
                        key={`choice_${choice.id}`}
                        disableGutters
                        sx={{
                            borderRadius: (theme) =>
                                `${theme.shape.borderRadius}px`,

                            ...(choice.correct && {
                                backgroundColor: (theme) =>
                                    alpha(theme.palette.success.main, 0.1),
                            }),
                        }}
                    >
                        <ListItemIcon>
                            {!block.multipleCorrect && (
                                <Radio
                                    disabled
                                    color="primary"
                                    checked={
                                        block?.answer?.indexOf(choice.id) >= 0
                                    }
                                />
                            )}
                            {block.multipleCorrect && (
                                <Checkbox
                                    disabled
                                    color="primary"
                                    checked={
                                        block?.answer?.indexOf(choice.id) >= 0
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
};
