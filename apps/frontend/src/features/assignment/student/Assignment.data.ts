import { StoreObject, useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { Feedback } from "interface/Feedback.interface";
import { Submission } from "interface/Submission.interface";

// *******************************************
// Read assignment
// *******************************************

export const assignmentQuery = gql`
    query Assignment($id: ID!, $publicKey: String) {
        assignment(id: $id) {
            id
            title
            introduction
            hasIntroduction
            visible
            isOptional
            isStudyMaterial
            difficulty
            keywords
            completed
            forceBlockOrder
            assessmentType
            hasGrading
            blocks {
                id
                index
                type
                title
                text
                videoLink
                editor
                programmingLanguage
                hasRangeLimit
                weight
                granularity
                assessmentMethod
                allowedFileExtensions
                files {
                    id
                    mimetype
                    label
                    extension
                    url
                    thumbnail
                }
                choices {
                    id
                    label
                    text
                    correct
                    correctScore
                    wrongScore
                }
                multipleCorrect
                hasSolution
                solution
                template
                answer(publicKey: $publicKey)
                feedback(publicKey: $publicKey) {
                    text
                    log
                    code
                    attemptCount
                    score
                    justificationText
                }
                actions {
                    id
                    teacherOnly
                }
                completed(publicKey: $publicKey)
            }
            module {
                id
                title
                visible
                startDate
                endDate
                course {
                    id
                    code
                    title
                    archived
                    startDate
                    endDate
                    role
                    permissions
                }
                assignments {
                    id
                    completed
                }
            }
            submission {
                id
                submittedDate
                time
                rating
                comment
                sticker
                studentRatingDifficulty
                studentRatingUsefulness
                studentComment
                score
                grade
                isApproved
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
`;

export const assignmentPublicQuery = gql`
    query Assignment($publicKey: String!) {
        assignmentByKey(publicKey: $publicKey) {
            id
            title
            introduction
            hasIntroduction
            visible
            isOptional
            isStudyMaterial
            difficulty
            keywords
            completed
            forceBlockOrder
            assessmentType
            hasGrading
            publicKey
            blocks {
                id
                index
                type
                title
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
                multipleCorrect
                hasSolution
                solution
                template
                answer(publicKey: $publicKey)
                feedback(publicKey: $publicKey) {
                    text
                    log
                    code
                    attemptCount
                    score
                    justificationText
                }
                actions {
                    id
                    teacherOnly
                }
                completed(publicKey: $publicKey)
            }
            module {
                id
                title
                visible
                startDate
                endDate
                course {
                    id
                    code
                    title
                    archived
                    startDate
                    endDate
                    role
                    permissions
                }
            }
            submission(publicKey: $publicKey) {
                submittedDate
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
`;

export const useAssignment = (id: string) =>
    useQuery<{
        assignment: Assignment;
    }>(assignmentQuery, { variables: { id }, fetchPolicy: "network-only" });

export const usePublicAssignment = (publicKey: string) => {
    return useQuery<{ assignmentByKey: Assignment }>(assignmentPublicQuery, {
        variables: { publicKey },
        fetchPolicy: "network-only",
    });
};

// *******************************************
// Start submission
// *******************************************

export const useStartSubmission = () =>
    useMutation<{
        startSubmission: Submission;
    }>(gql`
        mutation startSubmission($id: ID!) {
            startSubmission(id: $id) {
                id
                submittedDate
                time
                rating
                comment
                sticker
                studentRatingDifficulty
                studentRatingUsefulness
                studentComment
                assignment {
                    id
                    publicKey
                }
            }
        }
    `);

// *******************************************
// Record assignment activity
// *******************************************

export const useRecordAssignmentActivity = () =>
    useMutation<{
        recordAssignmentActivity: Block;
    }>(gql`
        mutation recordAssignmentActivity($id: ID!) {
            recordAssignmentActivity(id: $id) {
                id
                submission {
                    id
                    submittedDate
                    time
                    rating
                    comment
                    sticker
                    studentRatingDifficulty
                    studentRatingUsefulness
                    studentComment
                }
            }
        }
    `);

// *******************************************
// Update block answer
// *******************************************

export const useUpdateAnswer = () =>
    useMutation<{
        updateAnswer: Block;
    }>(
        gql`
            mutation UpdateAnswers(
                $id: ID!
                $data: [String!]!
                $publicKey: String
            ) {
                updateAnswer(id: $id, data: $data, publicKey: $publicKey) {
                    id
                    answer(publicKey: $publicKey)
                }
            }
        `
    );

// *******************************************
// Upload submission file
// *******************************************

export const useUploadSubmissionFile = () =>
    useMutation<{
        uploadSubmissionFile: Block;
    }>(gql`
        mutation UploadSubmissionFile($blockId: ID!, $input: FileInput!) {
            uploadSubmissionFile(blockId: $blockId, input: $input) {
                id
                answer
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
    `);

// *******************************************
// Update submission file
// *******************************************

export const useUpdateSubmissionFile = () =>
    useMutation<{
        updateSubmissionFile: Block;
    }>(gql`
        mutation UpdateSubmissionFile(
            $blockId: ID!
            $fileId: ID!
            $input: FileUpdateInput!
        ) {
            updateSubmissionFile(
                blockId: $blockId
                fileId: $fileId
                input: $input
            ) {
                id
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
    `);

// *******************************************
// Delete submission file
// *******************************************

export const useDeleteSubmissionFile = () =>
    useMutation<{
        deleteSubmissionFile: Block;
    }>(gql`
        mutation DeleteSubmissionFile($blockId: ID!, $fileId: ID!) {
            deleteSubmissionFile(blockId: $blockId, fileId: $fileId) {
                id
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
    `);

// *******************************************
// Compute feedback
// *******************************************

export const useComputeFeedback = () =>
    useMutation<
        {
            computeFeedback: StoreObject;
        },
        {
            id: string;
            languageData?: any;
            publicKey?: string;
        }
    >(
        gql`
            mutation computeFeedback(
                $id: ID!
                $languageData: JSON
                $publicKey: String
            ) {
                computeFeedback(
                    id: $id
                    languageData: $languageData
                    publicKey: $publicKey
                ) {
                    id
                    completed(publicKey: $publicKey)
                    feedback(publicKey: $publicKey) {
                        text
                        log
                        code
                        attemptCount
                        score
                        justificationText
                    }
                }
            }
        `
    );

export const useComputeFeedbackPreview = () =>
    useMutation<{
        computeFeedbackPreview: Feedback;
    }>(gql`
        mutation computeFeedbackPreview(
            $id: ID!
            $answer: [String!]!
            $languageData: JSON
        ) {
            computeFeedbackPreview(
                id: $id
                answer: $answer
                languageData: $languageData
            ) {
                text
                log
                code
                attemptCount
                score
            }
        }
    `);

// *******************************************
// Complete block
// *******************************************

export const useCompleteBlock = () =>
    useMutation<
        {
            completeBlock: Block;
        },
        { id: string; publicKey?: string }
    >(
        gql`
            mutation completeBlock($id: ID!, $publicKey: String) {
                completeBlock(id: $id, publicKey: $publicKey) {
                    id
                    completed(publicKey: $publicKey)
                    solution
                }
            }
        `
    );

// *******************************************
// Update assignment review
// *******************************************

export const useUpdateAssignmentReview = () =>
    useMutation<{
        updateAssignmentReview: Assignment;
    }>(gql`
        mutation updateAssignmentReview(
            $id: ID!
            $input: AssignmentUpdateReviewInput!
        ) {
            updateAssignmentReview(id: $id, input: $input) {
                id
                submission {
                    id
                    studentRatingDifficulty
                    studentRatingUsefulness
                    studentComment
                }
            }
        }
    `);

// *******************************************
// Submit assignment
// *******************************************

export const useSubmitAssignment = () =>
    useMutation<{
        submitAssignment: Assignment;
    }>(gql`
        mutation SubmitAssignment(
            $id: ID!
            $input: AssignmentUpdateReviewInput
        ) {
            submitAssignment(id: $id, input: $input) {
                id
                completed
                submission {
                    id
                    submittedDate
                    time
                    score
                    grade
                }
                unapprovedSubmissionCount
                module {
                    id
                    completed
                    course {
                        id
                    }
                }
                blocks {
                    id
                    feedback {
                        score
                        text
                    }
                }
            }
        }
    `);
