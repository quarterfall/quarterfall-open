import { Schema, Types } from "mongoose";

export interface IFile extends Types.Subdocument {
    label?: string;
    extension?: string;
    path: string;
    mimetype: string;
    cropX?: number;
    cropY?: number;
    cropWidth?: number;
    cropHeight?: number;
}

/**
 * Schema implementation.
 */
export const fileSchema = new Schema(
    {
        label: String,
        extension: String,
        mimetype: String,
        path: String,
        cropX: Number,
        cropY: Number,
        cropWidth: Number,
        cropHeight: Number,
    },
    { timestamps: true }
);
