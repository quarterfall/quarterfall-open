import { IDocument } from "./IDocument";
import mongoose = require("mongoose");

export interface IInvitation extends IDocument {
    userId: mongoose.Types.ObjectId;
    organizationId: mongoose.Types.ObjectId;
    inviterId: mongoose.Types.ObjectId;
    roleId: mongoose.Types.ObjectId;
}

const invitationSchema = new mongoose.Schema<IInvitation>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        organizationId: mongoose.Schema.Types.ObjectId,
        inviterId: mongoose.Schema.Types.ObjectId,
        roleId: mongoose.Schema.Types.ObjectId,
        metadata: mongoose.Schema.Types.Mixed,
    },
    { timestamps: true }
);

// Index for most-used filters to improve performance
invitationSchema.index({
    userId: 1,
    inviterId: 1,
});

/**
 * Schema implementation.
 */
// tslint:disable-next-line variable-name
export const DBInvitation = mongoose.model<IInvitation>(
    "invitation",
    invitationSchema
);
