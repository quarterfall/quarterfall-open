import { StickerType } from "core";
import { Assignment } from "./Assignment.interface";
import { User } from "./User.interface";

export interface Submission {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    assignment: Assignment;
    submittedDate?: Date;
    time?: number;
    rating?: number;
    sticker?: StickerType;
    comment?: string;
    studentRatingDifficulty?: number;
    studentRatingUsefulness?: number;
    studentComment?: string;
    student: User;
    metadata?: any;
    score?: number;
    grade?: string;
    isApproved?: boolean;
    needsAssessment?: boolean;
    isTeacherTest?: boolean;
}
