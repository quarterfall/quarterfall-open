import mongoose = require("mongoose");
import { fileSchema, IFile } from "./File";
import { IDocument } from "./IDocument";

export interface IOrganization extends IDocument {
    name: string;
    subdomain: string;
    country: string;
    website: string;
    appBarColor: string;
    primaryColor: string;
    secondaryColor: string;
    logo?: IFile;
    logoMobile?: IFile;
    archived?: boolean;
    allowAnonymousSubmissions?: boolean;

    // license information
    licenseRenewalDate: Date;
    licenseRemark: string;

    licenseTotalStudentCredits: number;
    licenseUsedStudentCredits: number;

    licenseEnforceRenewalDate: boolean;

    // billing information
    billingName: string;
    billingPhoneNumber: string;
    billingEmailAddress: string;
    billingAddressLine1: string;
    billingAddressLine2: string;
    billingPostalCode: string;
    billingCity: string;
    billingCountryCode: string;
    billingVAT: string;

    // analytics
    analyticsBlocks: mongoose.Types.ObjectId[];
    courseAnalyticsBlockDefaults: mongoose.Types.ObjectId[];

    // sso
    ssoProvider?: string;
    emailDomainNames?: string[];
}

/**
 * Schema implementation.
 */
const organizationSchema = new mongoose.Schema(
    {
        name: String,
        subdomain: String,
        country: String,
        website: String,
        appBarColor: String,
        primaryColor: String,
        secondaryColor: String,
        logo: fileSchema,
        logoMobile: fileSchema,
        archived: Boolean,
        allowAnonymousSubmissions: {
            type: Boolean,
            default: false,
        },

        licenseRenewalDate: Date,
        licenseRemark: String,
        licenseTotalStudentCredits: Number,
        licenseUsedStudentCredits: Number,
        licenseEnforceRenewalDate: Boolean,

        billingName: String,
        billingPhoneNumber: String,
        billingEmailAddress: String,
        billingAddressLine1: String,
        billingAddressLine2: String,
        billingPostalCode: String,
        billingCity: String,
        billingCountryCode: String,
        billingVAT: String,

        analyticsBlocks: [mongoose.Schema.Types.ObjectId],
        courseAnalyticsBlockDefaults: [mongoose.Schema.Types.ObjectId],

        metadata: mongoose.Schema.Types.Mixed,

        ssoProvider: String,
        emailDomainNames: [String],
    },
    { timestamps: true }
);

// tslint:disable-next-line variable-name
export const DBOrganization = mongoose.model<IOrganization>(
    "organization",
    organizationSchema
);
