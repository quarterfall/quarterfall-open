import { fileSchema, IFile } from "./File";
import { IDocument } from "./IDocument";
import mongoose = require("mongoose");

export interface IUser extends IDocument {
    firstName: string;
    lastName: string;
    emailAddress: string;
    avatar?: IFile;
    hashedPassword: string;
    salts: string[];
    country: string;
    language: string;
    tosAcceptanceDate: Date;
    tosAcceptanceIp: string;
    organizations: mongoose.Types.ObjectId[];
    isSysAdmin: boolean;
    lastActive: Date;
}

/**
 * Schema implementation.
 */
// tslint:disable-next-line variable-name
export const DBUser = mongoose.model<IUser>(
    "user",
    new mongoose.Schema(
        {
            firstName: String,
            lastName: String,
            emailAddress: {
                type: String,
                lowercase: true,
            },
            avatar: fileSchema,
            hashedPassword: String,
            salts: [String],
            country: String,
            language: String,
            lastActive: {
                type: Date,
                default: new Date(),
            },
            tosAcceptanceDate: Date,
            tosAcceptanceIp: String,
            organizations: [mongoose.Schema.Types.ObjectId],
            isSysAdmin: {
                type: Boolean,
                default: false,
            },
            metadata: mongoose.Schema.Types.Mixed,
        },
        {
            timestamps: true,
        }
    )
);
