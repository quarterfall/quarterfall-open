import { Grid } from "@mui/material";
import { BlockType } from "core";
import { Block } from "interface/Block.interface";
import { EditCodeQuestionForm } from "./EditCodeQuestionForm";
import { EditDatabaseQuestionForm } from "./EditDatabaseQuestionForm";
import { EditFileUploadQuestionForm } from "./EditFileUploadQuestionForm";
import { EditMultipleChoiceQuestionForm } from "./EditMultipleChoiceQuestionForm";
import { EditOpenQuestionForm } from "./EditOpenQuestionForm";
import { EditTextQuestionForm } from "./EditTextQuestionForm";

export interface EditBlockProps {
    block: Block;
}

export const EditQuestion = ({ block }: EditBlockProps) => {
    return (
        <Grid container direction="column" spacing={3}>
            <Grid item>
                {block.type === BlockType.Text && (
                    <EditTextQuestionForm block={block} />
                )}
                {block.type === BlockType.OpenQuestion && (
                    <EditOpenQuestionForm block={block} />
                )}
                {block.type === BlockType.CodeQuestion && (
                    <EditCodeQuestionForm block={block} />
                )}
                {block.type === BlockType.MultipleChoiceQuestion && (
                    <EditMultipleChoiceQuestionForm block={block} />
                )}
                {block.type === BlockType.DatabaseQuestion && (
                    <EditDatabaseQuestionForm block={block} />
                )}
                {block.type === BlockType.FileUploadQuestion && (
                    <EditFileUploadQuestionForm block={block} />
                )}
            </Grid>
        </Grid>
    );
};
