import mongoose = require("mongoose");
import { IDocument } from "./IDocument";

export interface ISystem extends IDocument {
    analyticsDefaultOrganizationId: mongoose.Types.ObjectId;
}

/**
 * Schema implementation.
 */
export const systemSchema = new mongoose.Schema<ISystem>(
    {
        analyticsDefaultOrganizationId: mongoose.Schema.Types.ObjectId,
        metadata: mongoose.Schema.Types.Mixed,
    },
    { timestamps: true }
);

// tslint:disable-next-line variable-name
export const DBSystem = mongoose.model<ISystem>("system", systemSchema);
