import { useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Assignment } from "interface/Assignment.interface";
import { Submission } from "interface/Submission.interface";

// *******************************************
// Retrieve a submission
// *******************************************

export const useSubmission = (id: string) =>
    useQuery<{
        submission: Submission;
    }>(
        gql`
            query Submission($id: ID!) {
                submission(id: $id) {
                    id
                    submittedDate
                    rating
                    comment
                    sticker
                    time
                    studentRatingDifficulty
                    studentRatingUsefulness
                    studentComment
                    score
                    grade
                    needsAssessment
                    isTeacherTest
                    isApproved
                    assignment {
                        id
                        title
                        introduction
                        hasIntroduction
                        isOptional
                        hasGrading
                        isStudyMaterial
                        assessmentType
                        completed(submissionId: $id)
                        submissions {
                            id
                            needsAssessment
                            isTeacherTest
                            isApproved
                            student {
                                id
                                firstName
                                lastName
                                emailAddress
                            }
                        }
                        blocks {
                            id
                            index
                            type
                            text
                            videoLink
                            editor
                            programmingLanguage
                            choices {
                                id
                                label
                                text
                                correct
                                correctScore
                                wrongScore
                            }
                            files(submissionId: $id) {
                                id
                                mimetype
                                label
                                extension
                                url
                                thumbnail
                            }
                            completed(submissionId: $id)
                            isAssessed(submissionId: $id)
                            hasSolution
                            solution
                            multipleCorrect
                            answer(submissionId: $id)
                            assessmentMethod
                            granularity
                            weight
                            hasRangeLimit
                            criteriaText
                            feedback(submissionId: $id) {
                                text
                                log
                                code
                                score
                                originalScore
                                attemptCount
                                justificationText
                            }
                        }
                        module {
                            id
                            title
                            course {
                                id
                                title
                                code
                                image
                                selectedImage
                                permissions
                                role
                                archived
                            }
                        }
                        files {
                            id
                            mimetype
                            label
                            extension
                            url
                            thumbnail
                        }
                    }
                    student {
                        id
                        firstName
                        lastName
                        emailAddress
                    }
                }
            }
        `,
        { variables: { id } }
    );

export const useAnonymousSubmission = (id: string) =>
    useQuery<{
        submission: Submission;
    }>(
        gql`
            query Submission($id: ID!) {
                submission(id: $id) {
                    id
                    submittedDate
                    needsAssessment
                    isTeacherTest
                    isApproved
                    assignment {
                        id
                        title
                        introduction
                        hasIntroduction
                        isOptional
                        hasGrading
                        isStudyMaterial
                        assessmentType
                        completed(submissionId: $id)
                        blocks {
                            id
                            index
                            type
                            text
                            videoLink
                            editor
                            programmingLanguage
                            choices {
                                id
                                label
                                text
                                correct
                                correctScore
                                wrongScore
                            }
                            files(submissionId: $id) {
                                id
                                mimetype
                                label
                                extension
                                url
                                thumbnail
                            }
                            completed(submissionId: $id)
                            isAssessed(submissionId: $id)
                            hasSolution
                            solution
                            multipleCorrect
                            answer(submissionId: $id)
                            assessmentMethod
                            granularity
                            weight
                            hasRangeLimit
                            criteriaText
                            feedback(submissionId: $id) {
                                text
                                log
                                code
                                score
                                originalScore
                                attemptCount
                                justificationText
                            }
                        }
                        module {
                            id
                            title
                            course {
                                id
                                title
                                code
                                image
                                selectedImage
                                permissions
                                role
                                archived
                            }
                        }
                        files {
                            id
                            mimetype
                            label
                            extension
                            url
                            thumbnail
                        }
                    }
                }
            }
        `,
        { variables: { id } }
    );

// *******************************************
// Update a submission
// *******************************************

export const useUpdateSubmission = () =>
    useMutation<{
        updateSubmission: Submission;
    }>(gql`
        mutation updateSubmission($id: ID!, $input: SubmissionUpdateInput!) {
            updateSubmission(id: $id, input: $input) {
                id
                rating
                comment
                sticker
            }
        }
    `);

// *******************************************
// Reopen a submission
// *******************************************

export const useReopenSubmission = () =>
    useMutation<{
        reopenSubmission: Submission;
    }>(gql`
        mutation reopenSubmission($id: ID!) {
            reopenSubmission(id: $id) {
                id
                submittedDate
            }
        }
    `);

export const useReopenSubmissions = () =>
    useMutation<{
        reopenSubmissions: Submission[];
    }>(gql`
        mutation reopenSubmissions($submissionIds: [ID!]!) {
            reopenSubmissions(submissionIds: $submissionIds) {
                id
                submittedDate
            }
        }
    `);

// *******************************************
// Delete a submission
// *******************************************

export const useResetAnonymousSubmission = () =>
    useMutation<{
        resetAnonymousSubmission: Assignment;
    }>(gql`
        mutation resetAnonymousSubmission($publicKey: String!) {
            resetAnonymousSubmission(publicKey: $publicKey) {
                id
                submission(publicKey: $publicKey) {
                    id
                    submittedDate
                }
            }
        }
    `);
export const useDeleteSubmission = () =>
    useMutation<{
        deleteSubmission: Submission;
    }>(gql`
        mutation deleteSubmission($id: ID!) {
            deleteSubmission(id: $id) {
                id
            }
        }
    `);

export const useDeleteSubmissions = () =>
    useMutation<{
        deleteSubmissions: Submission[];
    }>(gql`
        mutation deleteSubmissions($submissionIds: [ID!]!) {
            deleteSubmissions(submissionIds: $submissionIds) {
                id
            }
        }
    `);

export const useApproveSubmission = () =>
    useMutation<{
        approveSubmission: Submission;
    }>(gql`
        mutation approveSubmission($id: ID!) {
            approveSubmission(id: $id) {
                id
                isApproved
                needsAssessment
                isTeacherTest
                score
                grade
                assignment {
                    id
                    unapprovedSubmissionCount
                }
                student {
                    id
                    firstName
                    lastName
                    emailAddress
                }
            }
        }
    `);

export const useUnapproveSubmissions = () =>
    useMutation<{
        unapproveSubmission: Submission[];
    }>(gql`
        mutation unapproveSubmissions($submissionIds: [ID!]!) {
            unapproveSubmissions(submissionIds: $submissionIds) {
                id
                isApproved
                needsAssessment
                isTeacherTest
                student {
                    id
                    firstName
                    lastName
                    emailAddress
                }
                score
                grade
            }
        }
    `);
