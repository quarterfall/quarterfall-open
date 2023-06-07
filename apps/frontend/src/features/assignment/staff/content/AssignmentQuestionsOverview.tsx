import { Grid } from "@mui/material";
import { QuestionCard } from "features/question/staff/QuestionCard";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { Flipped, Flipper } from "react-flip-toolkit";

type Props = {
    assignment: Assignment;
};

export const AssignmentQuestionsOverview = (props: Props) => {
    const { assignment } = props;
    const blocks = assignment?.blocks || [];

    const flipKey = blocks.map((item) => item.id).join("-");

    return (
        <Flipper flipKey={flipKey}>
            <Grid container spacing={1} direction="column">
                {blocks.map((block: Block, index: number) => {
                    const key = `block_${block.id}`;
                    return (
                        <Flipped key={key} flipId={`block_${block.id}`}>
                            <Grid item xs>
                                <QuestionCard
                                    assignment={assignment}
                                    block={block}
                                />
                            </Grid>
                        </Flipped>
                    );
                })}
            </Grid>
        </Flipper>
    );
};
