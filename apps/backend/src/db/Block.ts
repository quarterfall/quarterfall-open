import {
    AssessmentMethod,
    BlockType,
    Choice,
    EditorType,
    ProgrammingLanguage,
} from "core";
import { model, Schema, Types } from "mongoose";
import { IDocument } from "./IDocument";

export interface IBlock extends IDocument {
    assignmentId: Types.ObjectId;
    index: number;
    title: string;
    text: string;
    videoLink: string;
    type: BlockType;
    programmingLanguage: ProgrammingLanguage;
    choices: Choice[];
    multipleCorrect: boolean;
    editor: EditorType;
    actions: Types.ObjectId[];
    solution: string;
    template: string;
    weight: number;
    granularity: number;
    hasRangeLimit: boolean;
    criteriaText: string;
    assessmentMethod: AssessmentMethod;
    allowedFileExtensions: string;
}

export const blockSchema = new Schema<IBlock>(
    {
        assignmentId: Schema.Types.ObjectId,
        index: Number,
        title: String,
        text: String,
        videoLink: String,
        type: {
            type: String,
            default: BlockType.Text,
        },
        programmingLanguage: String,
        choices: [Schema.Types.Mixed],
        multipleCorrect: Boolean,
        editor: String,
        actions: [Schema.Types.ObjectId],
        solution: String,
        template: String,
        metadata: Schema.Types.Mixed,
        weight: Number,
        granularity: Number,
        hasRangeLimit: Boolean,
        criteriaText: String,
        assessmentMethod: {
            type: String,
        },
        allowedFileExtensions: String,
    },
    { timestamps: true }
);

// Index for most-used filters to improve performance
blockSchema.index({ assignmentId: 1 });

// tslint:disable-next-line variable-name
export const DBBlock = model<IBlock>("block", blockSchema);
