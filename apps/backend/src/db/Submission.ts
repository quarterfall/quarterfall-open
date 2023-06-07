import { StickerType } from "core";
import { model, Schema, Types } from "mongoose";
import { fileSchema, IFile } from "./File";
import { IDocument } from "./IDocument";

export interface ISubmission extends IDocument {
    assignmentId: Types.ObjectId;
    userId?: Types.ObjectId;
    organizationId?: Types.ObjectId;
    answers: Types.DocumentArray<IBlockAnswers>;
    feedback: Types.DocumentArray<IBlockFeedback>;
    submittedDate?: Date;
    time?: number;
    sticker?: StickerType;
    rating?: number;
    comment?: string;
    completedBlocks: Types.ObjectId[];

    //grading
    score?: number;
    grade?: string;
    isApproved?: boolean;

    // student activity measurement
    studentActivityTimestamps: number[];

    // student rating and comment
    studentRatingDifficulty?: number;
    studentRatingUsefulness?: number;
    studentComment?: string;
}

export interface IBlockFeedback extends Types.Subdocument {
    blockId: Types.ObjectId;
    text: string[];
    log: string[];
    code: number;
    attemptCount: number;
    score: number;
    originalScore?: number;
    justificationText?: string;
}

export interface IBlockAnswers extends Types.Subdocument {
    blockId: Types.ObjectId;
    data: string[];
    files?: IFile[];
}

const answerSchema = new Schema({
    blockId: Schema.Types.ObjectId,
    data: [String],
    files: [fileSchema],
});

const feedbackSchema = new Schema({
    blockId: Schema.Types.ObjectId,
    text: [String],
    log: [String],
    code: Number,
    attemptCount: Number,
    score: Number,
    originalScore: Number,
    justificationText: String,
});

const schema = new Schema<ISubmission>(
    {
        assignmentId: Schema.Types.ObjectId,
        userId: Schema.Types.ObjectId,
        organizationId: Schema.Types.ObjectId,
        answers: [answerSchema],
        feedback: [feedbackSchema],
        completedBlocks: [Schema.Types.ObjectId],
        score: Number,
        grade: String,
        submittedDate: Date,
        time: Number,
        sticker: String,
        rating: Number,
        comment: String,
        studentActivityTimestamps: [Number],
        studentRatingDifficulty: Number,
        studentRatingUsefulness: Number,
        studentComment: String,
        metadata: Schema.Types.Mixed,
        isApproved: Boolean,
    },
    { timestamps: true }
);

// Index for most-used filters to improve performance
schema.index({ assignmentId: 1, userId: 1, organizationId: 1 });

// tslint:disable-next-line variable-name
export const DBSubmission = model<ISubmission>("submission", schema);
