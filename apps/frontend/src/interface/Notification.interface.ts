import { NotificationType } from "core";
import { Assignment } from "./Assignment.interface";
import { User } from "./User.interface";

export interface Notification {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: NotificationType;
    read: boolean;
    hidden: boolean;
    actor: User;
    receiver: User;
    text?: string;
    link?: string;
    assignment?: Assignment;
    metadata?: any;
}
