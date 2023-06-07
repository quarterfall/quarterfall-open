import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import dynamic from "next/dynamic";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));

interface ViewSubmissionTextQuestionProps {
    assignment: Assignment;
    block: Block;
}

export function ViewSubmissionTextQuestion(
    props: ViewSubmissionTextQuestionProps
) {
    const { assignment, block } = props;

    if (!block.text) {
        return null;
    } else {
        return <Markdown files={assignment.files}>{block.text}</Markdown>;
    }
}
