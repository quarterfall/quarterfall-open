import { useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { AnalyticsBlock } from "interface/AnalyticsBlock.interface";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { Course } from "interface/Course.interface";
import { Module } from "interface/Module.interface";

// *******************************************
// Read analytics block presets
// *******************************************

export const useAnalyticsBlockPresets = () =>
    useQuery<{
        publishedAnalyticsBlockPresets: AnalyticsBlock[];
    }>(
        gql`
            query publishedAnalyticsBlockPresets {
                publishedAnalyticsBlockPresets {
                    id
                    presetName
                    type
                }
            }
        `
    );

// *******************************************
// Read an assignment
// *******************************************

export const useAssignment = (id: string) =>
    useQuery<{
        assignment: Assignment;
    }>(
        gql`
            query Assignment($id: ID!) {
                assignment(id: $id) {
                    id
                    publicKey
                    title
                    avgDifficulty
                    avgUsefulness
                    visible
                    hasSubmissions
                    blocks {
                        id
                        index
                        title
                        type
                    }
                    module {
                        id
                        title
                        visible
                        course {
                            id
                            title
                            role
                            permissions
                            image
                            selectedImage
                            analyticsBlocks {
                                id
                                type
                                title
                                code
                                fullWidth
                                cache {
                                    targetId
                                    result
                                }
                            }
                            modules {
                                id
                                assignments {
                                    id
                                }
                            }
                            students {
                                id
                            }
                        }
                        assignments {
                            id
                            title
                            completed
                        }
                    }
                }
            }
        `,
        { variables: { id } }
    );

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
                    id
                    title
                    course {
                        id
                        title
                        role
                        permissions
                        image
                        selectedImage
                        analyticsBlocks {
                            id
                            type
                            title
                            code
                            fullWidth
                            cache {
                                targetId
                                result
                            }
                        }
                    }
                    assignments {
                        id
                    }
                }
            }
        `,
        { variables: { id } }
    );

// *******************************************
// Add course analytics block
// *******************************************

export const useAddCourseAnalyticsBlock = () =>
    useMutation<{
        addCourseAnalyticsBlock: Course;
    }>(gql`
        mutation addCourseAnalyticsBlock(
            $courseId: ID!
            $type: AnalyticsType!
            $presetId: ID
        ) {
            addCourseAnalyticsBlock(
                courseId: $courseId
                type: $type
                presetId: $presetId
            ) {
                id
                analyticsBlocks {
                    id
                    type
                    title
                    code
                    fullWidth
                    cache {
                        targetId
                        result
                    }
                }
            }
        }
    `);

// *******************************************
// Update course analytics block
// *******************************************

export const useUpdateCourseAnalyticsBlock = () =>
    useMutation<{
        updateCourseAnalyticsBlock: Block;
    }>(gql`
        mutation updateCourseAnalyticsBlock(
            $id: ID!
            $input: AnalyticsBlockUpdateInput!
        ) {
            updateCourseAnalyticsBlock(id: $id, input: $input) {
                id
                type
                title
                code
                fullWidth
            }
        }
    `);

// *******************************************
// Move course analytics block to index
// *******************************************

export const useMoveCourseAnalyticsBlockToIndex = () =>
    useMutation<{
        moveCourseAnalyticsBlockToIndex: Course;
    }>(gql`
        mutation moveCourseAnalyticsBlockToIndex($index: Int!, $id: ID!) {
            moveCourseAnalyticsBlockToIndex(index: $index, id: $id) {
                id
                analyticsBlocks {
                    id
                }
            }
        }
    `);

// *******************************************
// Delete course analytics block
// *******************************************

export const useDeleteCourseAnalyticsBlock = () =>
    useMutation<{
        deleteCourseAnalyticsBlock: Course;
    }>(gql`
        mutation deleteCourseAnalyticsBlock($id: ID!) {
            deleteCourseAnalyticsBlock(id: $id) {
                id
                analyticsBlocks {
                    id
                }
            }
        }
    `);

// *******************************************
// Compute course analytics block data
// *******************************************

export const useComputeAnalyticsBlock = () =>
    useMutation<
        {
            computeAnalyticsBlock: {
                blockId: string;
                log: string[];
                result: string;
            };
        },
        {
            id: string;
            targetId?: string;
            courseId?: string;
        }
    >(gql`
        mutation computeAnalyticsBlock($id: ID!, $targetId: ID, $courseId: ID) {
            computeAnalyticsBlock(
                id: $id
                targetId: $targetId
                courseId: $courseId
            ) {
                blockId
                log
                result
            }
        }
    `);
