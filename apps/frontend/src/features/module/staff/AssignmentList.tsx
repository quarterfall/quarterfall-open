import { Box, Stack } from "@mui/material";
import { isAfter, min } from "date-fns";
import { Course } from "interface/Course.interface";
import { Module } from "interface/Module.interface";
import React from "react";
import { AssignmentStudentCard } from "./AssignmentStudentCard";

export interface AssignmentListProps {
    course: Course;
    module: Module;
    hideCompleted?: boolean;
    hideOptional?: boolean;
}

export function AssignmentList(props: AssignmentListProps) {
    const { course, module, hideCompleted, hideOptional } = props;

    const assignments = (module.assignments || []).filter(
        (a) =>
            (!hideCompleted || !a.completed) && (!hideOptional || !a.isOptional)
    );

    const isAvailable = module.startDate
        ? isAfter(new Date(), new Date(module.startDate))
        : true;

    // deadline checks
    const dates: Date[] = [];
    if (course.endDate) {
        dates.push(new Date(course.endDate));
    }
    if (module.endDate) {
        dates.push(new Date(module.endDate));
    }
    const endDate = dates.length > 0 ? min(dates) : null;
    const closed = endDate ? isAfter(new Date(), new Date(endDate)) : false;

    return (
        <Stack spacing={1}>
            {assignments.map((assignment) => (
                <Box key={`assignment_${assignment.id}`} width="100%">
                    <AssignmentStudentCard
                        assignment={assignment}
                        readOnly={!isAvailable || closed}
                    />
                </Box>
            ))}
        </Stack>
    );
}
