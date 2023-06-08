import { useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { AnalyticsBlock } from "interface/AnalyticsBlock.interface";

// *******************************************
// Read analytics block presets
// *******************************************

export const useAnalyticsBlockPresets = () =>
    useQuery<{
        analyticsBlockPresets: AnalyticsBlock[];
    }>(
        gql`
            query AnalyticsBlockPresets {
                analyticsBlockPresets {
                    id
                    title
                    presetName
                    type
                    published
                    fullWidth
                }
            }
        `
    );

// *******************************************
// Read single analytics block presets
// *******************************************

export const useAnalyticsBlockPreset = (id: string) =>
    useQuery<{
        analyticsBlockPreset: AnalyticsBlock;
    }>(
        gql`
            query AnalyticsBlockPreset($id: ID!) {
                analyticsBlockPreset(id: $id) {
                    id
                    title
                    presetName
                    type
                    code
                    fullWidth
                    published
                }
            }
        `,
        { variables: { id } }
    );

// *******************************************
// Add analytics block preset
// *******************************************

export const useAddAnalyticsBlockPreset = () =>
    useMutation<{
        addAnalyticsBlockPreset: AnalyticsBlock;
    }>(gql`
        mutation addAnalyticsBlockPreset(
            $presetName: String!
            $type: AnalyticsType!
        ) {
            addAnalyticsBlockPreset(presetName: $presetName, type: $type) {
                id
                title
                presetName
                type
                code
                fullWidth
                published
            }
        }
    `);

// *******************************************
// Update analytics block preset
// *******************************************

export const useUpdateAnalyticsBlockPreset = () =>
    useMutation<{
        updateAnalyticsBlockPreset: AnalyticsBlock;
    }>(gql`
        mutation updateAnalyticsBlockPreset(
            $id: ID!
            $input: AnalyticsBlockPresetUpdateInput!
        ) {
            updateAnalyticsBlockPreset(id: $id, input: $input) {
                id
                type
                title
                presetName
                code
                fullWidth
                published
            }
        }
    `);

// *******************************************
// Delete analytics block preset
// *******************************************

export const useDeleteAnalyticsBlockPresets = () =>
    useMutation<{
        deleteAnalyticsBlockPreset: AnalyticsBlock[];
    }>(gql`
        mutation deleteAnalyticsBlockPresets($ids: [ID!]!) {
            deleteAnalyticsBlockPresets(ids: $ids) {
                id
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
