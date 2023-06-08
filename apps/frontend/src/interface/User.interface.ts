import { RoleType } from "core";
import { Course } from "./Course.interface";
import { Invitation } from "./Invitation.interface";
import { Notification } from "./Notification.interface";
import { Organization } from "./Organization.interface";
import { Submission } from "./Submission.interface";

export interface User {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    firstName: string;
    lastName: string;
    avatarName: string;
    emailAddress: string;
    language: string;
    isSysAdmin: boolean;
    isStudent: boolean;
    isActive: boolean;
    organization?: Organization;
    organizations: Organization[];
    courses: Course[];
    completedModuleCount: number;
    avatarImageLarge: string;
    avatarImageSmall: string;
    notifications: Notification[];
    unreadNotifications: number;
    courseRole?: RoleType;
    organizationRole?: RoleType;
    invitations: Invitation[];
    metadata?: any;
    submissions?: Submission[];
}
