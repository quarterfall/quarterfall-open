import { Permission, RoleType } from "core";
import { AnalyticsBlock } from "./AnalyticsBlock.interface";
import { Event } from "./Event.interface";
import { Module } from "./Module.interface";
import { User } from "./User.interface";

export interface Course {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    code: string;
    description: string;
    publicCode?: string;
    modules: Module[];
    archived?: boolean;
    visible?: boolean;
    demo?: boolean;
    library?: boolean;
    startDate: Date;
    endDate: Date;
    image?: string;
    selectedImage?: string;
    role?: RoleType;
    permissions: Permission[];
    analyticsBlocks: AnalyticsBlock[];
    staff: User[];
    students: User[];
    studentCount?: number;
    metadata?: any;
    events?: Event[];
    enrollmentCode?: string;
}
