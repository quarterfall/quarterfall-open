import { Permission, RoleType } from "core";
import { AnalyticsBlock } from "./AnalyticsBlock.interface";
import { GradingScheme } from "./GradingScheme.interface";
import { User } from "./User.interface";

export interface Organization {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    website: string;
    appBarColor?: string;
    primaryColor?: string;
    secondaryColor?: string;
    role: RoleType;
    permissions: Permission[];
    logo?: string;
    logoMobile?: string;
    archived?: boolean;
    allowAnonymousSubmissions?: boolean;

    licenseRenewalDate?: Date;
    licenseRemark?: string;
    licenseTotalStudentCredits?: number;
    licenseUsedStudentCredits?: number;
    licenseEnforceRenewalDate?: boolean;

    billingName?: string;
    billingPhoneNumber?: string;
    billingEmailAddress?: string;
    billingAddressLine1?: string;
    billingAddressLine2?: string;
    billingPostalCode?: string;
    billingCity?: string;
    billingCountryCode?: string;
    billingVAT?: string;

    courseAnalyticsBlockDefaults: AnalyticsBlock[];

    admins: User[];

    metadata?: any;

    gradingSchemes?: GradingScheme[];

    ssoProvider?: string;
    emailDomainNames?: string[];
}
