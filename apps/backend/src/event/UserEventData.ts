import { RoleType } from "core";
import { IAssignment } from "db/Assignment";
import { IOrganization } from "db/Organization";
import { IUser } from "db/User";

export interface UserCreatedEventData {
    context: string;
    user: Partial<IUser>;
    userRole: RoleType;
    organization: Partial<IOrganization>;
    assignment?: Partial<IAssignment>;
    teacher?: Partial<IUser>;
}

export interface UserUpdatedEventData {
    context: string;
    user: Partial<IUser>;
    userRole: RoleType;
    organization: Partial<IOrganization>;
}
