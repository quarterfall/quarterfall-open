import { model, Schema, Types } from "mongoose";
import { IDocument } from "./IDocument";

export interface IGradingScheme extends IDocument {
    organizationId?: Types.ObjectId;
    assignmentId?: Types.ObjectId;
    name: string;
    description?: string;
    code: string;
    isDefault: boolean;
}

const gradingSchemeSchema = new Schema(
    {
        organizationId: Schema.Types.ObjectId,
        assignmentId: Schema.Types.ObjectId,
        name: String,
        description: String,
        code: String,
        isDefault: Boolean,
    },
    { timestamps: true }
);

// tslint:disable-next-line variable-name
export const DBGradingScheme = model<IGradingScheme>(
    "gradingScheme",
    gradingSchemeSchema
);
