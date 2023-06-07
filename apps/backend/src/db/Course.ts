import mongoose = require("mongoose");
import { fileSchema, IFile } from "./File";
import { IDocument } from "./IDocument";

export interface ICourse extends IDocument {
    code: string;
    title: string;
    description: string;
    publicCode?: string;
    organizationId?: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    analyticsBlocks: mongoose.Types.ObjectId[];
    archived?: boolean;
    startDate?: Date;
    endDate?: Date;
    demo: boolean;
    library: boolean;
    visible: boolean;
    image?: IFile;
    selectedImage?: string;
    analyticsNeedRecompute?: boolean;
    enrollmentCode?: string;
}

/**
 * Schema implementation.
 */
export const courseSchema = new mongoose.Schema<ICourse>(
    {
        code: String,
        title: String,
        description: String,
        publicCode: String,
        organizationId: mongoose.Schema.Types.ObjectId,
        userId: mongoose.Schema.Types.ObjectId,
        analyticsBlocks: [mongoose.Schema.Types.ObjectId],
        archived: {
            type: Boolean,
            default: false,
        },
        demo: {
            type: Boolean,
            default: false,
        },
        library: {
            type: Boolean,
            default: false,
        },
        visible: {
            type: Boolean,
            default: false,
        },
        image: fileSchema,
        selectedImage: String,
        startDate: Date,
        endDate: Date,
        metadata: mongoose.Schema.Types.Mixed,
        analyticsNeedRecompute: Boolean,
        enrollmentCode: String,
    },
    { timestamps: true }
);

// Index for most-used filters to improve performance
courseSchema.index({ archived: 1, organizationId: 1, demo: 1, publicCode: 1 });

// tslint:disable-next-line variable-name
export const DBCourse = mongoose.model<ICourse>("course", courseSchema);
