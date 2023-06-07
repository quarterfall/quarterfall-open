import { isAfter, isBefore, max, min } from "date-fns";
import { Assignment } from "interface/Assignment.interface";

export function getAssignmentStartDate(assignment: Assignment): Date | null {
    const module = assignment.module;
    const course = module.course;

    const startDates: Date[] = [];
    if (course.startDate) {
        startDates.push(new Date(course.startDate));
    }
    if (module.startDate) {
        startDates.push(new Date(module.startDate));
    }
    return startDates.length > 0 ? max(startDates) : null;
}

export function getAssignmentEndDate(assignment: Assignment): Date | null {
    const module = assignment.module;
    const course = module.course;

    const endDates: Date[] = [];
    if (course.endDate) {
        endDates.push(new Date(course.endDate));
    }
    if (module.endDate) {
        endDates.push(new Date(module.endDate));
    }
    return endDates.length > 0 ? min(endDates) : null;
}

export function assignmentIsOpen(assignment: Assignment): boolean {
    const startDate = getAssignmentStartDate(assignment);
    const endDate = getAssignmentEndDate(assignment);
    return Boolean(
        !(startDate && endDate) ||
            (isAfter(new Date(), startDate) &&
                isBefore(new Date(), new Date(endDate)))
    );
}

export function assignmentWillOpen(assignment: Assignment): boolean {
    const startDate = getAssignmentStartDate(assignment);
    return Boolean(startDate && isBefore(new Date(), startDate));
}
