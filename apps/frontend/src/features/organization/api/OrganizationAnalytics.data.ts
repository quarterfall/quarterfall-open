import { useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { AnalyticsBlock } from "interface/AnalyticsBlock.interface";
import { Block } from "interface/Block.interface";
import { Organization } from "interface/Organization.interface";

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
// Add course analytics block default
// *******************************************

export const useAddCourseAnalyticsBlockDefault = () =>
    useMutation<{
        addCourseAnalyticsBlockDefault: Organization;
    }>(gql`
        mutation addCourseAnalyticsBlockDefault(
            $type: AnalyticsType!
            $presetId: ID
        ) {
            addCourseAnalyticsBlockDefault(type: $type, presetId: $presetId) {
                id
                courseAnalyticsBlockDefaults {
                    id
                    type
                    title
                    code
                    fullWidth
                }
            }
        }
    `);

// *******************************************
// Update course analytics block default
// *******************************************

export const useUpdateCourseAnalyticsBlockDefault = () =>
    useMutation<{
        updateCourseAnalyticsBlockDefault: Block;
    }>(gql`
        mutation updateCourseAnalyticsBlockDefault(
            $id: ID!
            $input: AnalyticsBlockUpdateInput!
        ) {
            updateCourseAnalyticsBlockDefault(id: $id, input: $input) {
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

export const useMoveCourseAnalyticsBlockDefaultToIndex = () =>
    useMutation<{
        moveCourseAnalyticsBlockDefaultToIndex: Organization;
    }>(gql`
        mutation moveCourseAnalyticsBlockDefaultToIndex(
            $index: Int!
            $id: ID!
        ) {
            moveCourseAnalyticsBlockDefaultToIndex(index: $index, id: $id) {
                id
                courseAnalyticsBlockDefaults {
                    id
                }
            }
        }
    `);

// *******************************************
// Delete course analytics block
// *******************************************

export const useDeleteCourseAnalyticsBlockDefault = () =>
    useMutation<{
        deleteCourseAnalyticsBlockDefault: Organization;
    }>(gql`
        mutation deleteCourseAnalyticsBlockDefault($id: ID!) {
            deleteCourseAnalyticsBlockDefault(id: $id) {
                id
                courseAnalyticsBlockDefaults {
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
                result: any;
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
