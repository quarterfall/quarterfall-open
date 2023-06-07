import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Organization } from "interface/Organization.interface";

/* Create grading scheme in organization */
export const useCreateGradingScheme = () =>
    useMutation<{
        createGradingScheme: Organization;
    }>(gql`
        mutation createGradingScheme {
            createGradingScheme {
                id
                name
                website
                archived
                gradingSchemes {
                    id
                    name
                    description
                    code
                    isDefault
                }
            }
        }
    `);

/* Update grading scheme */
export const useUpdateGradingScheme = () =>
    useMutation<{
        updateGradingScheme: Organization;
    }>(gql`
        mutation updateGradingScheme(
            $gradingSchemeId: ID!
            $input: GradingSchemeUpdateInput!
        ) {
            updateGradingScheme(
                gradingSchemeId: $gradingSchemeId
                input: $input
            ) {
                id
                name
                website
                archived
                gradingSchemes {
                    id
                    name
                    description
                    code
                    isDefault
                }
            }
        }
    `);

/* Delete grading scheme from organization */

export const useDeleteGradingScheme = () =>
    useMutation<{
        deleteGradingScheme: Organization;
    }>(gql`
        mutation deleteGradingScheme($gradingSchemeId: ID!) {
            deleteGradingScheme(gradingSchemeId: $gradingSchemeId) {
                id
                name
                website
                archived
                gradingSchemes {
                    id
                    name
                    description
                    code
                    isDefault
                }
            }
        }
    `);

/* Delete grading scheme from organization */

export const useResetGradingSchemes = () =>
    useMutation<{
        resetGradingSchemesToDefault: Organization;
    }>(gql`
        mutation resetGradingSchemesToDefault {
            resetGradingSchemesToDefault {
                id
                gradingSchemes {
                    id
                    name
                    description
                    code
                    isDefault
                }
            }
        }
    `);

/* Test grading scheme */
export const useTestGradingScheme = () =>
    useMutation(gql`
        mutation testGradingScheme(
            $testData: String!
            $gradingSchemeCode: String!
        ) {
            testGradingScheme(
                testData: $testData
                gradingSchemeCode: $gradingSchemeCode
            ) {
                result
                code
                log
            }
        }
    `);
