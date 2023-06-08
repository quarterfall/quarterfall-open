import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, darken, lighten } from "@mui/material";
import { arrayMove, Permission } from "core";
import { useMoveAssignmentToIndex } from "features/assignment/staff/api/Assignment.data";
import { usePermission } from "hooks/usePermission";
import { Course } from "interface/Course.interface";
import { Module } from "interface/Module.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AddModuleDialog } from "./AddModuleDialog";
import { useMoveModuleToIndex } from "./api/Module.data";
import { ModuleColumn } from "./ModuleColumn";

export interface EditCourseModulesProps {
    course: Course;
    loading?: boolean;
}

export default function EditCourseModules(props: EditCourseModulesProps) {
    const [addModuleDialogOpen, setAddModuleDialogOpen] = useState(false);
    const [moveModuleToIndexMutation] = useMoveModuleToIndex();
    const [moveAssignmentToIndexMutation] = useMoveAssignmentToIndex();
    const { t } = useTranslation();
    const can = usePermission();

    const { course, loading } = props;
    const modules = course?.modules || [];

    const canUpdateCourse = can(Permission.updateCourse, course);

    const onDragEnd = async (result, provided) => {
        const { destination, source, draggableId, type } = result;

        if (!destination) {
            return;
        }

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        if (type === "column") {
            // moving a module
            const module = modules.find((m) => m.id === draggableId);
            if (!module) {
                return;
            }

            // compute the updated array
            const modulesCopy = [...modules];
            arrayMove({
                array: modulesCopy,
                oldIndex: source.index,
                newIndex: destination.index,
            });

            // construct the optimistic response
            const optimisticResponse: any = {
                moveModuleToIndex: {
                    __typename: "Course",
                    id: course?.id,
                    modules: modulesCopy.map((m, index) => ({
                        __typename: "Module",
                        id: m.id,
                        index,
                    })),
                },
            };

            await moveModuleToIndexMutation({
                variables: {
                    courseId: course?.id,
                    moduleId: module.id,
                    index: destination.index,
                },
                optimisticResponse,
            });

            return;
        }

        // moving a task

        const home = modules.find((m) => m.id === source.droppableId);
        const foreign = modules.find((m) => m.id === destination.droppableId);
        if (!home || !foreign) {
            return;
        }

        const homeAssignments = [...home.assignments];
        const foreignAssignments = [...foreign.assignments];
        const assignment = homeAssignments.find((a) => a.id === draggableId);
        if (!assignment) {
            return;
        }

        const getAssignments = (m: Module) => {
            if (m === home) {
                return homeAssignments;
            } else if (m == foreign) {
                return foreignAssignments;
            } else {
                return m.assignments;
            }
        };

        // move within the same column
        if (home === foreign) {
            // compute the assignment array

            arrayMove({
                array: homeAssignments,
                oldIndex: source.index,
                newIndex: destination.index,
            });

            // construct the optimistic response
            const optimisticResponse: any = {
                moveAssignmentToIndex: {
                    __typename: "Course",
                    id: course?.id,
                    modules: modules.map((m, index) => ({
                        __typename: "Module",
                        id: m.id,
                        index,
                        assignments: getAssignments(m).map((a, aInd) => ({
                            __typename: "Assignment",
                            id: a.id,
                            index: aInd,
                            module: {
                                __typename: "Module",
                                id: m.id,
                            },
                        })),
                    })),
                },
            };

            await moveAssignmentToIndexMutation({
                variables: {
                    moduleId: home.id,
                    assignmentId: assignment.id,
                    index: destination.index,
                },
                optimisticResponse,
            });
        } else {
            // compute the new assignment arrays
            arrayMove({
                array: homeAssignments,
                oldIndex: source.index,
                newIndex: destination.index,
                newArray: foreignAssignments,
            });

            // construct the optimistic response
            const optimisticResponse: any = {
                moveAssignmentToIndex: {
                    __typename: "Course",
                    id: course?.id,
                    modules: modules.map((m, index) => ({
                        __typename: "Module",
                        id: m.id,
                        index,
                        assignments: getAssignments(m).map((a, aInd) => ({
                            __typename: "Assignment",
                            id: a.id,
                            index: aInd,
                            module: {
                                __typename: "Module",
                                id: m.id,
                            },
                        })),
                    })),
                },
            };

            // moving from one list to another
            await moveAssignmentToIndexMutation({
                variables: {
                    moduleId: foreign.id,
                    assignmentId: assignment.id,
                    index: destination.index,
                },
                optimisticResponse,
            });
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
                droppableId="all-columns"
                direction="horizontal"
                type="column"
            >
                {(provided) => (
                    <Box
                        sx={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "stretch",
                            overflowX: "auto", // allow for horizontal scrolling
                            minHeight: 0,
                            overflowY: "hidden",
                            padding: 1,
                        }}
                        id="module-assignment-list"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                    >
                        {modules.map((module, index) => (
                            <ModuleColumn
                                key={module.id}
                                course={course}
                                module={module}
                                index={index}
                                loading={loading}
                            />
                        ))}
                        {provided.placeholder}
                        {canUpdateCourse && !loading && (
                            <Box>
                                {/* this div is needed to ensure right margin is respected */}
                                <Button
                                    sx={(theme) => ({
                                        marginRight: 1,
                                        width: "300px",
                                        height: "60px",
                                        color: theme.palette.getContrastText(
                                            theme.palette.mode === "dark"
                                                ? lighten(
                                                      theme.palette.background
                                                          .paper,
                                                      0.03
                                                  )
                                                : darken(
                                                      theme.palette.background
                                                          .paper,
                                                      0.03
                                                  )
                                        ),
                                        borderColor: theme.palette.divider,
                                        backgroundColor:
                                            theme.palette.mode === "dark"
                                                ? theme.palette.background.paper
                                                : darken(
                                                      theme.palette.background
                                                          .paper,
                                                      0.03
                                                  ),
                                        ":hover": {
                                            backgroundColor:
                                                theme.palette.mode === "dark"
                                                    ? lighten(
                                                          theme.palette
                                                              .background.paper,
                                                          0.08
                                                      )
                                                    : darken(
                                                          theme.palette
                                                              .background.paper,
                                                          0.08
                                                      ),
                                        },
                                    })}
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={() => setAddModuleDialogOpen(true)}
                                    data-cy="createModuleButton"
                                >
                                    {t("module:add")}
                                </Button>
                            </Box>
                        )}
                    </Box>
                )}
            </Droppable>
            {/* Add module dialog */}
            <AddModuleDialog
                course={course}
                open={addModuleDialogOpen}
                onClose={() => setAddModuleDialogOpen(false)}
            />
        </DragDropContext>
    );
}
