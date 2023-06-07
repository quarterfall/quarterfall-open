import { add, isAfter, isBefore, max, min } from "date-fns";
import { Assignment } from "interface/Assignment.interface";
import { Course } from "interface/Course.interface";
import { Module } from "interface/Module.interface";

export function getModuleStartDate(
    module: Module,
    course: Course
): Date | null {
    const startDates: Date[] = [];
    if (course?.startDate) {
        startDates.push(new Date(course.startDate));
    }
    if (module?.startDate) {
        startDates.push(new Date(module.startDate));
    }
    return startDates.length > 0 ? max(startDates) : null;
}

export function getModuleEndDate(module: Module, course: Course): Date | null {
    const endDates: Date[] = [];
    if (course?.endDate) {
        endDates.push(new Date(course.endDate));
    }
    if (module?.endDate) {
        endDates.push(new Date(module.endDate));
    }
    return endDates.length > 0 ? min(endDates) : null;
}

export function moduleIsOpen(module: Module, course: Course): boolean {
    const startDate = getModuleStartDate(module, course);
    const endDate = getModuleEndDate(module, course);
    return Boolean(
        !(startDate && endDate) ||
            (isAfter(new Date(), startDate) &&
                isBefore(new Date(), new Date(endDate)))
    );
}

export function moduleWillOpen(module: Module, course: Course): boolean {
    const startDate = getModuleStartDate(module, course);
    return Boolean(startDate && isBefore(new Date(), startDate));
}

export function moduleIsAvailable(module: Module, course: Course): boolean {
    const startDate = getModuleStartDate(module, course);
    return startDate ? isAfter(new Date(), new Date(startDate)) : true;
}

export function moduleClosesWithinThreeDays(
    module: Module,
    course: Course
): boolean {
    const endDate = getModuleEndDate(module, course);
    return endDate
        ? open && isAfter(add(new Date(), { days: 3 }), endDate)
        : false;
}

export function getNextAssignment(module: Module): Assignment {
    const assignments = module?.assignments || [];
    return assignments.find((assignment) => !assignment.completed);
}
