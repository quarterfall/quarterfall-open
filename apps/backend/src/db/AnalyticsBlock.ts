import { AnalyticsType } from "core";
import { model, Schema, Types } from "mongoose";
import { IDocument } from "./IDocument";

export interface IAnalyticsBlock extends IDocument {
    subjectId: Types.ObjectId;
    presetId?: Types.ObjectId;
    presetName: string;
    isGlobalPreset: boolean;
    published: boolean;
    title: string;
    code: string;
    fullWidth: boolean;
    type: AnalyticsType;
    cacheIds: Types.ObjectId[];
}

export const analyticsBlockSchema = new Schema<IAnalyticsBlock>(
    {
        subjectId: Schema.Types.ObjectId,
        presetId: Schema.Types.ObjectId,
        presetName: String,
        isGlobalPreset: Boolean,
        published: Boolean,
        title: String,
        code: String,
        type: String,
        fullWidth: Boolean,
        metadata: Schema.Types.Mixed,
        cacheIds: [Schema.Types.ObjectId],
    },
    { timestamps: true }
);

// Index for most-used filters to improve performance
analyticsBlockSchema.index({ subjectId: 1 });

// tslint:disable-next-line variable-name
export const DBAnalyticsBlock = model<IAnalyticsBlock>(
    "analyticsblock",
    analyticsBlockSchema
);
