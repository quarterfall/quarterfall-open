import mongoose = require("mongoose");

import { IDocument } from "./IDocument";

export interface IModule extends IDocument {
    title: string;
    description: string;
    visible: boolean;
    startDate: Date;
    endDate: Date;
    courseId: mongoose.Types.ObjectId;
    index: number;
}

/**
 * Schema implementation.
 */
export const moduleSchema = new mongoose.Schema<IModule>(
    {
        title: String,
        description: String,
        visible: {
            type: Boolean,
            default: true,
        },
        startDate: Date,
        endDate: Date,
        courseId: mongoose.Schema.Types.ObjectId,
        index: Number,
        metadata: mongoose.Schema.Types.Mixed,
    },
    { timestamps: true }
);

// Index for most-used filters to improve performance
moduleSchema.index({ visible: 1, courseId: 1 });

// tslint:disable-next-line variable-name
export const DBModule = mongoose.model<IModule>("module", moduleSchema);
