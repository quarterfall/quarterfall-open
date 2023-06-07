import { useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Course } from "interface/Course.interface";
import { Module } from "interface/Module.interface";

const moduleFields = `
    id
    title
    description
    visible
    index
    startDate
    endDate
    completed
    course {
        id
        title
        code
        permissions
    }
    assignments {
        id
        completed
        title
        index
        visible
        isOptional
        isStudyMaterial
        difficulty
    }
`;

// *******************************************
// Read a module
// *******************************************

export const useModule = (id: string) =>
    useQuery<{
        module: Module;
    }>(
        gql`
            query Module($id: ID!) {
                module(id: $id) {
                    ${moduleFields}
                }
            }
        `,
        { variables: { id } }
    );

// *******************************************
// Update module
// *******************************************

export const useUpdateModule = () =>
    useMutation<{
        updateModule: Module;
    }>(gql`
        mutation updateModule($id: ID!, $input: ModuleUpdateInput!) {
            updateModule(id: $id, input: $input) {
                ${moduleFields}
            }
        }
    `);

// *******************************************
// Create a module
// *******************************************

export const useCreateModule = () =>
    useMutation<
        {
            createModule: Course;
        },
        {
            courseId: string;
            input: Partial<Module>;
            beforeIndex?: number;
        }
    >(gql`
        mutation CreateModule(
            $courseId: ID!
            $input: ModuleCreateInput!
            $beforeIndex: Int
        ) {
            createModule(
                courseId: $courseId
                input: $input
                beforeIndex: $beforeIndex
            ) {
                id
                modules {
                    ${moduleFields}
                }
            }
        }
    `);

// *******************************************
// Merge a module
// *******************************************

export const useMergeModule = () =>
    useMutation<
        {
            mergeModule: Course;
        },
        {
            id: string;
            targetIndex?: number;
        }
    >(gql`
        mutation MergeModule($id: ID!, $targetIndex: Int) {
            mergeModule(id: $id, targetIndex: $targetIndex) {
                id
                modules {
                    ${moduleFields}
                }
            }
        }
    `);

// *******************************************
// Copy module
// *******************************************

export const useCopyModule = () =>
    useMutation<
        {
            copyModule: Course;
        },
        {
            id: string;
            courseId?: string;
        }
    >(gql`
        mutation CopyModule($id: ID!, $courseId: ID) {
            copyModule(id: $id, courseId: $courseId) {
                id
                modules {
                    ${moduleFields}
                }
            }
        }
    `);

// *******************************************
// Delete module
// *******************************************

export const useDeleteModule = () =>
    useMutation<{
        deleteModule: Course;
    }>(gql`
        mutation DeleteModule($id: ID!) {
            deleteModule(id: $id) {
                id
                modules {
                    id
                }
            }
        }
    `);

// *******************************************
// Move module to index
// *******************************************

export const useMoveModuleToIndex = () =>
    useMutation<{
        moveModuleToIndex: Course;
    }>(gql`
        mutation MoveModuleToIndex(
            $courseId: ID!
            $moduleId: ID!
            $index: Int!
        ) {
            moveModuleToIndex(
                courseId: $courseId
                moduleId: $moduleId
                index: $index
            ) {
                id
                modules {
                    id
                    index
                }
            }
        }
    `);
