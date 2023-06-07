import { useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";
import { Course } from "interface/Course.interface";
import { Module } from "interface/Module.interface";

// *******************************************
// Create assignment
// *******************************************

export const useCreateAssignment = () =>
    useMutation<
        {
            createAssignment: Module;
        },
        {
            moduleId: string;
            input: Partial<Assignment>;
            beforeIndex?: number;
        }
    >(gql`
        mutation CreateAssignment(
            $input: AssignmentCreateInput!
            $moduleId: ID!
            $beforeIndex: Int
        ) {
            createAssignment(
                input: $input
                moduleId: $moduleId
                beforeIndex: $beforeIndex
            ) {
                id
                assignments {
                    id
                    title
                    visible
                    isStudyMaterial
                    index
                    hasGrading
                }
            }
        }
    `);

// *******************************************
// Merge assignments
// *******************************************

export const useMergeAssignment = () =>
    useMutation<
        {
            mergeAssignment: Module;
        },
        {
            id: string;
            targetIndex?: number;
        }
    >(gql`
        mutation MergeAssignment($id: ID!, $targetIndex: Int) {
            mergeAssignment(id: $id, targetIndex: $targetIndex) {
                id
                assignments {
                    id
                    title
                    introduction
                    hasIntroduction
                    visible
                    isOptional
                    isStudyMaterial
                    difficulty
                    forceBlockOrder
                    index
                    blocks {
                        id
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
                        multipleCorrect
                        actions {
                            id
                            type
                            condition
                            scoreExpression
                            stopOnMatch
                            code
                            text
                            textOnMismatch
                            gitUrl
                            gitBranch
                            gitPrivateKey
                            forceOverrideCache
                            databaseFileLabel
                            databaseDialect
                            path
                            url
                            tests {
                                id
                                name
                                description
                                code
                                isCode
                            }
                            ioTests {
                                id
                                name
                                description
                                input
                                output
                                comparisonCode
                            }
                            hideFeedback
                            answerEmbedding
                            imports
                            teacherOnly
                        }
                        solution
                        template
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
    `);

// *******************************************
// Read assignment
// *******************************************

export const assignmentQuery = gql`
    query Assignment($id: ID!) {
        assignment(id: $id) {
            id
            moduleId
            shareCode
            publicKey
            title
            introduction
            hasIntroduction
            visible
            isOptional
            isStudyMaterial
            difficulty
            avgDifficulty
            avgUsefulness
            keywords
            completed
            forceBlockOrder
            author
            license
            remarks
            assessmentType
            gradingSchemeName
            gradingSchemeDescription
            gradingSchemeCode
            unapprovedSubmissionCount
            hasGrading
            gradingSchemes {
                id
                name
                description
                code
                isDefault
            }
            blocks {
                id
                index
                type
                text
                title
                videoLink
                editor
                programmingLanguage
                hasRangeLimit
                weight
                granularity
                assessmentMethod
                criteriaText
                allowedFileExtensions
                choices {
                    id
                    label
                    text
                    correct
                    correctScore
                    wrongScore
                }
                multipleCorrect
                actions {
                    id
                    type
                    condition
                    scoreExpression
                    stopOnMatch
                    code
                    text
                    textOnMismatch
                    gitUrl
                    gitBranch
                    gitPrivateKey
                    forceOverrideCache
                    databaseFileLabel
                    databaseDialect
                    path
                    url
                    tests {
                        id
                        name
                        description
                        code
                        isCode
                    }
                    ioTests {
                        id
                        name
                        description
                        input
                        output
                        comparisonCode
                    }
                    hideFeedback
                    answerEmbedding
                    imports
                    teacherOnly
                }
                solution
                template
                answer
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
                    image
                    selectedImage
                    library
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
                    title
                    completed
                }
            }
            hasSubmissions
            submission {
                id
                submittedDate
                rating
                comment
                sticker
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

export const useAssignment = (id: string) => {
    return useQuery<{
        assignment: Assignment;
    }>(assignmentQuery, { variables: { id } });
};

// *******************************************
// Update assignment
// *******************************************

export const useUpdateAssignment = () =>
    useMutation<{
        updateAssignment: Assignment;
    }>(gql`
        mutation updateAssignment($id: ID!, $input: AssignmentUpdateInput!) {
            updateAssignment(id: $id, input: $input) {
                id
                index
                title
                introduction
                hasIntroduction
                visible
                isOptional
                isStudyMaterial
                forceBlockOrder
                difficulty
                keywords
                author
                license
                remarks
                hasGrading
                assessmentType
                gradingSchemeName
                gradingSchemeDescription
                gradingSchemeCode
                gradingSchemes {
                    id
                }
                blocks {
                    id
                    weight
                    granularity
                    hasRangeLimit
                    assessmentMethod
                    criteriaText
                    allowedFileExtensions
                    actions {
                        id
                        type
                    }
                }
            }
        }
    `);

// *******************************************
// Add block to assignment
// *******************************************

export const useAddBlock = () =>
    useMutation<
        {
            addBlock: Assignment;
        },
        {
            assignmentId: string;
            input: Partial<Block>;
            beforeIndex?: number;
        }
    >(gql`
        mutation AddBlock(
            $assignmentId: ID!
            $input: BlockAddInput!
            $beforeIndex: Int
        ) {
            addBlock(
                assignmentId: $assignmentId
                input: $input
                beforeIndex: $beforeIndex
            ) {
                id
                isOptional
                isStudyMaterial
                blocks {
                    id
                    index
                    type
                    text
                    title
                    videoLink
                    editor
                    programmingLanguage
                    hasRangeLimit
                    weight
                    granularity
                    criteriaText
                    assessmentMethod
                    allowedFileExtensions
                    choices {
                        id
                        label
                        text
                        correct
                        correctScore
                        wrongScore
                    }
                    multipleCorrect
                    actions {
                        id
                        type
                        condition
                        scoreExpression
                        stopOnMatch
                        code
                        text
                        textOnMismatch
                        gitUrl
                        gitBranch
                        gitPrivateKey
                        forceOverrideCache
                        databaseFileLabel
                        databaseDialect
                        path
                        url
                        tests {
                            id
                            name
                            description
                            code
                            isCode
                        }
                        ioTests {
                            id
                            name
                            description
                            input
                            output
                            comparisonCode
                        }
                        hideFeedback
                        answerEmbedding
                        imports
                        teacherOnly
                    }
                    solution
                    template
                    answer
                }
            }
        }
    `);

// *******************************************
// Copy block
// *******************************************

export const useCopyBlock = () =>
    useMutation<{
        copyBlock: Assignment;
    }>(gql`
        mutation CopyBlock($assignmentId: ID, $id: ID!, $keepIndex: Boolean) {
            copyBlock(
                assignmentId: $assignmentId
                id: $id
                keepIndex: $keepIndex
            ) {
                id
                isOptional
                isStudyMaterial
                blocks {
                    id
                    index
                    type
                    text
                    title
                    videoLink
                    editor
                    programmingLanguage
                    hasRangeLimit
                    weight
                    granularity
                    criteriaText
                    assessmentMethod
                    allowedFileExtensions
                    choices {
                        id
                        label
                        text
                        correct
                        correctScore
                        wrongScore
                    }
                    multipleCorrect
                    actions {
                        id
                        type
                        condition
                        scoreExpression
                        stopOnMatch
                        code
                        text
                        textOnMismatch
                        gitUrl
                        gitBranch
                        gitPrivateKey
                        forceOverrideCache
                        databaseFileLabel
                        databaseDialect
                        path
                        url
                        tests {
                            id
                            name
                            description
                            code
                            isCode
                        }
                        ioTests {
                            id
                            name
                            description
                            input
                            output
                            comparisonCode
                        }
                        hideFeedback
                        answerEmbedding
                        imports
                        teacherOnly
                    }
                    solution
                    template
                    answer
                }
            }
        }
    `);

// *******************************************
// Update block
// *******************************************

export const useUpdateBlock = () =>
    useMutation<{
        updateBlock: Block;
    }>(gql`
        mutation UpdateBlock($id: ID!, $input: BlockUpdateInput!) {
            updateBlock(id: $id, input: $input) {
                id
                index
                type
                text
                title
                videoLink
                editor
                programmingLanguage
                hasRangeLimit
                weight
                granularity
                criteriaText
                assessmentMethod
                allowedFileExtensions
                choices {
                    id
                    label
                    text
                    correct
                    correctScore
                    wrongScore
                }
                multipleCorrect
                actions {
                    id
                    type
                    condition
                    scoreExpression
                    stopOnMatch
                    code
                    text
                    textOnMismatch
                    gitUrl
                    gitBranch
                    gitPrivateKey
                    forceOverrideCache
                    databaseFileLabel
                    databaseDialect
                    path
                    url
                    tests {
                        id
                        name
                        description
                        code
                        isCode
                    }
                    ioTests {
                        id
                        name
                        description
                        input
                        output
                        comparisonCode
                    }
                    hideFeedback
                    answerEmbedding
                    imports
                    teacherOnly
                }
                solution
                template
            }
        }
    `);

// *******************************************
// Delete block
// *******************************************

export const useDeleteBlock = () =>
    useMutation<{
        deleteBlock: Assignment;
    }>(gql`
        mutation DeleteBlock($id: ID!) {
            deleteBlock(id: $id) {
                id
                isStudyMaterial
                blocks {
                    id
                    index
                }
            }
        }
    `);

// *******************************************
// Delete assignment
// *******************************************

export const useDeleteAssignment = () =>
    useMutation<{
        deleteAssignment: Module;
    }>(gql`
        mutation DeleteAssignment($id: ID!) {
            deleteAssignment(id: $id) {
                id
                assignments {
                    id
                    index
                }
            }
        }
    `);

// *******************************************
// Copy assignment
// *******************************************

export const useCopyAssignment = () =>
    useMutation<
        {
            copyAssignment: Course;
        },
        {
            id: string;
            moduleId?: string;
        }
    >(gql`
        mutation CopyAssignment($id: ID!, $moduleId: ID) {
            copyAssignment(id: $id, moduleId: $moduleId) {
                id
                modules {
                    id
                    title
                    description
                    visible
                    index
                    assignments {
                        id
                        index
                        completed
                        title
                        visible
                        isOptional
                        isStudyMaterial
                        difficulty
                    }
                }
            }
        }
    `);

// *******************************************
// Move assignment to index
// *******************************************

export const useMoveAssignmentToIndex = () =>
    useMutation<{
        moveAssignmentToIndex: Course;
    }>(gql`
        mutation MoveAssignmentToIndex(
            $moduleId: ID!
            $assignmentId: ID!
            $index: Int!
        ) {
            moveAssignmentToIndex(
                moduleId: $moduleId
                assignmentId: $assignmentId
                index: $index
            ) {
                id
                modules {
                    id
                    index
                    assignments {
                        id
                        index
                        module {
                            id
                        }
                    }
                }
            }
        }
    `);

// *******************************************
// Move block
// *******************************************

export const useMoveBlockToIndex = () =>
    useMutation<{
        moveBlockToIndex: Assignment;
    }>(gql`
        mutation MoveBlockToIndex($index: Int!, $id: ID!) {
            moveBlockToIndex(index: $index, id: $id) {
                id
                blocks {
                    id
                    index
                }
            }
        }
    `);

// *******************************************
// Upload assignment file
// *******************************************

export const useUploadAssignmentFile = () =>
    useMutation<{
        uploadAssignmentFile: Assignment;
    }>(gql`
        mutation UploadAssignmentFile($id: ID!, $input: FileInput!) {
            uploadAssignmentFile(id: $id, input: $input) {
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
// Update assignment file
// *******************************************

export const useUpdateAssignmentFile = () =>
    useMutation<{
        updateAssignmentFile: Assignment;
    }>(gql`
        mutation UpdateAssignmentFile(
            $id: ID!
            $fileId: ID!
            $input: FileUpdateInput!
        ) {
            updateAssignmentFile(id: $id, fileId: $fileId, input: $input) {
                id
                files {
                    id
                    label
                }
            }
        }
    `);

// *******************************************
// Delete assignment file
// *******************************************

export const useDeleteAssignmentFile = () =>
    useMutation<{
        deleteAssignmentFile: Assignment;
    }>(gql`
        mutation DeleteAssignmentFile($id: ID!, $fileId: ID!) {
            deleteAssignmentFile(id: $id, fileId: $fileId) {
                id
                files {
                    id
                }
            }
        }
    `);

// *******************************************
// Get feedback
// *******************************************

export const useComputeFeedbackPreview = () =>
    useMutation(gql`
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
// Share assignment
// *******************************************

export const useShareAssignment = () =>
    useMutation<{
        shareAssignment: Assignment;
    }>(gql`
        mutation shareAssignment($id: ID!) {
            shareAssignment(id: $id) {
                id
                shareCode
            }
        }
    `);

// *******************************************
// Stop sharing assignment
// *******************************************

export const useStopSharingAssignment = () =>
    useMutation<{
        stopSharingAssignment: Assignment;
    }>(gql`
        mutation stopSharingAssignment($id: ID!) {
            stopSharingAssignment(id: $id) {
                id
                shareCode
            }
        }
    `);

// *******************************************
// Import assignment
// *******************************************
export const useImportAssignment = () =>
    useMutation<{
        importAssignment: Assignment;
    }>(gql`
        mutation importAssignment($code: String!, $moduleId: ID!) {
            importAssignment(code: $code, moduleId: $moduleId) {
                id
                modules {
                    id
                    title
                    description
                    visible
                    index
                    assignments {
                        id
                        index
                        completed
                        title
                        visible
                        isOptional
                        isStudyMaterial
                        difficulty
                    }
                }
            }
        }
    `);

// *******************************************
// Recalculate grades
// *******************************************

export const useRecalculateGrades = () =>
    useMutation<{
        recalculateGrades: Assignment;
    }>(gql`
        mutation recalculateGrades($id: ID!) {
            recalculateGrades(id: $id) {
                id
                publicKey
                title
                introduction
                hasIntroduction
                isOptional
                isStudyMaterial
                difficulty
                keywords
                forceBlockOrder
                author
                license
                remarks
                assessmentType
                submissions {
                    id
                    submittedDate
                    rating
                    comment
                    sticker
                    score
                    grade
                    needsAssessment
                    isTeacherTest
                    isApproved
                    student {
                        id
                        firstName
                        lastName
                        emailAddress
                        avatarName
                    }
                }
            }
        }
    `);

// *******************************************
// Select grading scheme for assignment
// *******************************************

export const useChangeAssignmentGradingScheme = () =>
    useMutation<{
        changeAssignmentGradingScheme: Assignment;
    }>(gql`
        mutation changeAssignmentGradingScheme(
            $assignmentId: ID!
            $gradingSchemeId: String!
        ) {
            changeAssignmentGradingScheme(
                assignmentId: $assignmentId
                gradingSchemeId: $gradingSchemeId
            ) {
                id
                publicKey
                title
                introduction
                hasIntroduction
                isOptional
                isStudyMaterial
                difficulty
                keywords
                forceBlockOrder
                author
                license
                remarks
                assessmentType
                gradingSchemeName
                gradingSchemeDescription
                gradingSchemeCode
                gradingSchemes {
                    id
                    name
                    description
                    code
                }
            }
        }
    `);
