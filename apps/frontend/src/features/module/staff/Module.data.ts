import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Module } from "interface/Module.interface";

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
                    description
                    startDate
                    endDate
                    completed
                    course {
                        id
                        title
                        code
                        startDate
                        endDate
                        role
                        archived
                    }
                    assignments {
                        id
                        title
                        index
                        completed
                        isOptional
                        isStudyMaterial
                        difficulty
                        hasGrading
                        submission {
                            id
                            submittedDate
                            rating
                            comment
                            sticker
                            score
                            grade
                            isApproved
                        }
                        blocks {
                            id
                        }
                    }
                }
            }
        `,
        { variables: { id } }
    );
