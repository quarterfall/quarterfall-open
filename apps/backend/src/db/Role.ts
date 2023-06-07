import { RoleType } from "core";
import { IDocument } from "./IDocument";
import mongoose = require("mongoose");

export interface IRole extends IDocument {
    userId: mongoose.Types.ObjectId;
    subjectId: mongoose.Types.ObjectId;
    organizationId: mongoose.Types.ObjectId;
    active: boolean;
    role: RoleType;
}

const roleSchema = new mongoose.Schema<IRole>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        subjectId: mongoose.Schema.Types.ObjectId,
        organizationId: mongoose.Schema.Types.ObjectId,
        active: {
            type: Boolean,
            default: true,
        },
        role: String,
        metadata: mongoose.Schema.Types.Mixed,
    },
    { timestamps: true }
);

// Index for most-used filters to improve performance
roleSchema.index({
    userId: 1,
    subjectId: 1,
    organizationId: 1,
    active: 1,
    role: 1,
});

/**
 * Schema implementation.
 */
// tslint:disable-next-line variable-name
export const DBRole = mongoose.model<IRole>("role", roleSchema);
