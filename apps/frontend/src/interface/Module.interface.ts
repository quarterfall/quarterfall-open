import { Assignment } from "./Assignment.interface";
import { Course } from "./Course.interface";

export interface Module {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    description: string;
    visible: true;
    index: number;
    startDate: Date;
    endDate: Date;
    assignments: Assignment[];
    course: Course;
    completed: boolean;
    isOptional?: boolean;
    metadata?: any;
}
