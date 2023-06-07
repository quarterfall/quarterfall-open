import { EventType } from "core";
import { model, Schema, Types } from "mongoose";
import { IDocument } from "./IDocument";

export interface IEvent extends IDocument {
    organizationId?: Types.ObjectId;
    subjects: Types.ObjectId[];
    type: EventType;
    data: any;
}

export const eventSchema = new Schema<IEvent>(
    {
        organizationId: Schema.Types.ObjectId,
        subjects: [Schema.Types.ObjectId],
        type: String,
        data: Schema.Types.Mixed,
        metadata: Schema.Types.Mixed,
    },
    { timestamps: true }
);

// Index for most-used filters to improve performance
eventSchema.index({ organizationId: 1, subjects: 1 });

// tslint:disable-next-line variable-name
export const DBEvent = model<IEvent>("event", eventSchema);
