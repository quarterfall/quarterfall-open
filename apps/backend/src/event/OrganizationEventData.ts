import { IOrganization } from "db/Organization";
import { IUser } from "db/User";

export interface OrganizationUpdatedEventData {
    user: Partial<IUser>;
    organization: Partial<IOrganization>;
}

export interface OrganizationLicenseUpdatedEventData {
    user: Partial<IUser>;
    organization: Partial<IOrganization>;
    orderComment?: string;
}
