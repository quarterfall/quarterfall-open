import { AssessmentType, PublicLicenseType } from "core";
import { model, Schema, Types } from "mongoose";
import { fileSchema, IFile } from "./File";
import { IDocument } from "./IDocument";

export const assignmentImageSizes = {
    thumbnail: {
        width: 100,
        height: 100,
    },
};

export interface IAssignment extends IDocument {
    visible: boolean;
    moduleId: Types.ObjectId;
    organizationId: Types.ObjectId;
    publicKey?: string;
    shareCode?: string;
    searchString: string;
    files?: IFile[];
    title: string;
    hasIntroduction?: boolean;
    introduction?: string;
    index: number;
    keywords: string[];
    author: string;
    license: PublicLicenseType;
    remarks: string;
    difficulty?: number;
    isOptional?: boolean;
    forceBlockOrder?: boolean;
    assessmentType?: AssessmentType;
    gradingSchemeName?: string;
    gradingSchemeDescription?: string;
    gradingSchemeCode?: string;
}

export const assignmentSchema = new Schema<IAssignment>(
    {
        visible: {
            type: Boolean,
            default: true,
        },
        moduleId: Schema.Types.ObjectId,
        organizationId: Schema.Types.ObjectId,
        publicKey: {
            type: String,
            unique: true,
        },
        shareCode: String,
        searchString: String,
        files: [fileSchema],
        title: {
            type: String,
            required: true,
        },
        hasIntroduction: Boolean,
        introduction: String,
        index: Number,
        keywords: [String],
        author: String,
        license: String,
        remarks: String,
        difficulty: Number,
        isOptional: Boolean,
        forceBlockOrder: Boolean,
        metadata: Schema.Types.Mixed,
        assessmentType: { type: String },
        gradingSchemeName: String,
        gradingSchemeDescription: String,
        gradingSchemeCode: String,
    },
    { timestamps: true }
);

// Index for most-used filters to improve performance
assignmentSchema.index({
    visible: 1,
    moduleId: 1,
    organizationId: 1,
    publicKey: 1,
    shareCode: 1,
});

// tslint:disable-next-line variable-name
export const DBAssignment = model<IAssignment>("assignment", assignmentSchema);
