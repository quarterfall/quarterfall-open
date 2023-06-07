import { model, Schema, Types } from "mongoose";
import { IDocument } from "./IDocument";

export interface IAnalyticsBlockCache extends IDocument {
    analyticsBlockId: Types.ObjectId;
    targetId?: string;
    result?: string;
}

export const analyticsBlockCacheSchema = new Schema<IAnalyticsBlockCache>(
    {
        analyticsBlockId: Schema.Types.ObjectId,
        targetId: String,
        result: String,
    },
    { timestamps: true }
);

// Index for most-used filters to improve performance
analyticsBlockCacheSchema.index({
    targetId: 1,
    analyticsBlockId: 1,
});

// tslint:disable-next-line variable-name
export const DBAnalyticsBlockCache = model<IAnalyticsBlockCache>(
    "analyticsblockcache",
    analyticsBlockCacheSchema
);
