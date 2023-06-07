import { useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Assessment } from "interface/Assessment.interface";
import { Assignment } from "interface/Assignment.interface";
import { Block } from "interface/Block.interface";

// *******************************************
// Get block
// *******************************************

export const useBlock = (id: string) =>
    useQuery<{
        block: Block;
    }>(
        gql`
            query Block($id: ID!) {
                block(id: $id) {
                    id
                    type
                    text
                    editor
                    choices {
                        id
                        label
                        text
                        correct
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
                    answer
                }
            }
        `,
        { variables: { id } }
    );

// *******************************************
// Add a choice to a block
// *******************************************

export const useAddChoice = () =>
    useMutation<{
        addChoice: Block;
    }>(gql`
        mutation AddChoice($blockId: ID!, $input: ChoiceInput) {
            addChoice(blockId: $blockId, input: $input) {
                id
                choices {
                    id
                    label
                    text
                    correct
                }
            }
        }
    `);

// *******************************************
// Delete a choice from a block
// *******************************************

export const useDeleteChoice = () =>
    useMutation<{
        deleteChoice: Block;
    }>(gql`
        mutation DeleteChoice($blockId: ID!, $choiceId: ID!) {
            deleteChoice(blockId: $blockId, choiceId: $choiceId) {
                id
                choices {
                    id
                    label
                    text
                    correct
                }
            }
        }
    `);

// *******************************************
// Update a choice
// *******************************************

export const useUpdateChoice = () =>
    useMutation<{
        updateChoice: Block;
    }>(gql`
        mutation UpdateChoice(
            $blockId: ID!
            $choiceId: ID!
            $input: ChoiceInput!
        ) {
            updateChoice(
                blockId: $blockId
                choiceId: $choiceId
                input: $input
            ) {
                id
                choices {
                    id
                    label
                    text
                    correct
                    correctScore
                    wrongScore
                }
            }
        }
    `);
// *******************************************
// Update a choice
// *******************************************

export const useUpdateMultipleChoices = () =>
    useMutation<{
        updateMultipleChoices: Block;
    }>(gql`
        mutation UpdateMultipleChoices($blockId: ID!, $input: ChoiceInput!) {
            updateMultipleChoices(blockId: $blockId, input: $input) {
                id
                choices {
                    id
                    label
                    text
                    correct
                    correctScore
                    wrongScore
                }
            }
        }
    `);

// *******************************************
// Add action to block
// *******************************************

export const useAddAction = () =>
    useMutation<{
        addAction: Block;
    }>(gql`
        mutation AddAction(
            $blockId: ID!
            $type: String!
            $teacherOnly: Boolean
            $beforeIndex: Int
        ) {
            addAction(
                blockId: $blockId
                type: $type
                teacherOnly: $teacherOnly
                beforeIndex: $beforeIndex
            ) {
                id
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
            }
        }
    `);

// *******************************************
// Delete action from block
// *******************************************

export const useDeleteAction = () =>
    useMutation<{
        deleteAction: Block;
    }>(gql`
        mutation DeleteAction($id: ID!) {
            deleteAction(id: $id) {
                id
                actions {
                    id
                }
            }
        }
    `);
// *******************************************
// Duplicate action in block
// *******************************************

export const useDuplicateAction = () =>
    useMutation<{
        copyAction: Block;
    }>(gql`
        mutation CopyAction($id: ID!, $keepIndex: Boolean) {
            copyAction(id: $id, keepIndex: $keepIndex) {
                id
                actions {
                    id
                }
            }
        }
    `);

// *******************************************
// Update block action
// *******************************************

export const useUpdateAction = () =>
    useMutation<{
        updateAction: Block;
    }>(gql`
        mutation UpdateAction($id: ID!, $input: ActionInput!) {
            updateAction(id: $id, input: $input) {
                id
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
            }
        }
    `);

// *******************************************
// Move action to index
// *******************************************

export const useMoveActionToIndex = () =>
    useMutation<{
        moveActionToIndex: Block;
    }>(gql`
        mutation moveActionToIndex($id: ID!, $index: Int!) {
            moveActionToIndex(id: $id, index: $index) {
                id
                actions {
                    id
                }
            }
        }
    `);

// *******************************************
// Add unit test to action
// *******************************************

export const useAddUnitTest = () =>
    useMutation<{
        addUnitTestToAction: Block;
    }>(gql`
        mutation addUnitTestToAction(
            $actionId: ID!
            $input: UnitTestInput!
            $beforeIndex: Int
        ) {
            addUnitTestToAction(
                actionId: $actionId
                input: $input
                beforeIndex: $beforeIndex
            ) {
                id
                tests {
                    id
                    name
                    description
                    code
                    isCode
                }
            }
        }
    `);

// *******************************************
// Delete unit test from action
// *******************************************

export const useDeleteUnitTest = () =>
    useMutation<{
        deleteUnitTest: Block;
    }>(gql`
        mutation deleteUnitTest($id: ID!, $actionId: ID!) {
            deleteUnitTest(id: $id, actionId: $actionId) {
                id
                tests {
                    id
                    name
                    description
                    code
                    isCode
                }
            }
        }
    `);

// *******************************************
// Duplicate unit test from action
// *******************************************

export const useDuplicateUnitTest = () =>
    useMutation<{
        duplicateUnitTest: Block;
    }>(gql`
        mutation duplicateUnitTest($id: ID!, $actionId: ID!) {
            duplicateUnitTest(id: $id, actionId: $actionId) {
                id
                tests {
                    id
                    name
                    description
                    code
                    isCode
                }
            }
        }
    `);

// *******************************************
// Update unit test
// *******************************************

export const useUpdateUnitTest = () =>
    useMutation<{
        updateUnitTest: Block;
    }>(gql`
        mutation updateUnitTest(
            $actionId: ID!
            $id: ID!
            $input: UnitTestInput!
        ) {
            updateUnitTest(actionId: $actionId, id: $id, input: $input) {
                id
                tests {
                    id
                    name
                    description
                    code
                    isCode
                }
            }
        }
    `);

// *******************************************
// Move unit test to index
// *******************************************

export const useMoveUnitTestToIndex = () =>
    useMutation<{
        moveUnitTestToIndex: Block;
    }>(gql`
        mutation moveUnitTestToIndex($id: ID!, $actionId: ID!, $index: Int!) {
            moveUnitTestToIndex(id: $id, actionId: $actionId, index: $index) {
                id
                tests {
                    id
                    name
                    description
                    code
                    isCode
                }
            }
        }
    `);

// *******************************************
// Add io test to action
// *******************************************

export const useAddIOTest = () =>
    useMutation<{
        addIOTestToAction: Block;
    }>(gql`
        mutation addIOTestToAction(
            $actionId: ID!
            $input: IOTestInput!
            $beforeIndex: Int
        ) {
            addIOTestToAction(
                actionId: $actionId
                input: $input
                beforeIndex: $beforeIndex
            ) {
                id
                ioTests {
                    id
                    name
                    description
                    input
                    output
                    comparisonCode
                }
            }
        }
    `);

// *******************************************
// Delete io test from action
// *******************************************

export const useDeleteIOTest = () =>
    useMutation<{
        deleteIOTest: Block;
    }>(gql`
        mutation deleteIOTest($id: ID!, $actionId: ID!) {
            deleteIOTest(id: $id, actionId: $actionId) {
                id
                ioTests {
                    id
                    name
                    description
                    input
                    output
                    comparisonCode
                }
            }
        }
    `);

// *******************************************
// Duplicate io test from action
// *******************************************

export const useDuplicateIOTest = () =>
    useMutation<{
        duplicateIOTest: Block;
    }>(gql`
        mutation duplicateIOTest($id: ID!, $actionId: ID!) {
            duplicateIOTest(id: $id, actionId: $actionId) {
                id
                ioTests {
                    id
                    name
                    description
                    input
                    output
                    comparisonCode
                }
            }
        }
    `);

// *******************************************
// Update io test
// *******************************************

export const useUpdateIOTest = () =>
    useMutation<{
        updateIOTest: Block;
    }>(gql`
        mutation updateIOTest($actionId: ID!, $id: ID!, $input: IOTestInput!) {
            updateIOTest(actionId: $actionId, id: $id, input: $input) {
                id
                ioTests {
                    id
                    name
                    description
                    input
                    output
                    comparisonCode
                }
            }
        }
    `);

// *******************************************
// Move io test to index
// *******************************************

export const useMoveIOTestToIndex = () =>
    useMutation<{
        moveIOTestToIndex: Block;
    }>(gql`
        mutation moveIOTestToIndex($id: ID!, $actionId: ID!, $index: Int!) {
            moveIOTestToIndex(id: $id, actionId: $actionId, index: $index) {
                id
                ioTests {
                    id
                    name
                    description
                    input
                    output
                    comparisonCode
                }
            }
        }
    `);

// *******************************************
// Get solution
// *******************************************

export const useGetSolution = () =>
    useMutation<
        {
            getSolution: string;
        },
        { id: string; input: string[] }
    >(gql`
        mutation GetSolution($id: ID!, $input: [String!]!) {
            getSolution(id: $id, input: $input)
        }
    `);

// *******************************************
// Get feedback
// *******************************************

export const useComputeBlockFeedback = () =>
    useMutation<
        {
            computeBlockFeedback: Block;
        },
        { id: string; input: string[]; languageData?: any }
    >(gql`
        mutation computeBlockFeedback(
            $id: ID!
            $input: [String!]!
            $languageData: JSON
        ) {
            computeBlockFeedback(
                id: $id
                input: $input
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
// Update assessment settings
// *******************************************

export const useUpdateAssessmentSettings = () =>
    useMutation<
        { updateAssessmentSettings: Assessment },
        { blockId: string; input: Assessment }
    >(gql`
        mutation updateAssessmentSettings(
            $blockId: ID!
            $input: QuestionAssessmentUpdateInput!
        ) {
            updateAssessmentSettings(blockId: $blockId, input: $input) {
                id
                assessmentMethod
                weight
                granularity
                hasRangeLimit
                criteriaText
                choices {
                    id
                    correctScore
                    wrongScore
                }
            }
        }
    `);

export const useUpdateStudentAssessment = () =>
    useMutation<
        { updateStudentAssessment: Assignment },
        { blockId: string; score: number }
    >(gql`
        mutation updateStudentAssessment($blockId: ID!, $score: Float!) {
            updateStudentAssessment(blockId: $blockId, score: $score) {
                id
                blocks {
                    id
                    feedback {
                        text
                        log
                        code
                        attemptCount
                        score
                        originalScore
                    }
                }
            }
        }
    `);

export const useUpdateTeacherAssessment = () =>
    useMutation<{ updateTeacherAssessment: Assignment }>(gql`
        mutation updateTeacherAssessment(
            $blockId: ID!
            $submissionId: ID!
            $score: Float
            $justificationText: String
        ) {
            updateTeacherAssessment(
                blockId: $blockId
                submissionId: $submissionId
                score: $score
                justificationText: $justificationText
            ) {
                id
                score
                grade
                assignment {
                    id
                    blocks {
                        id
                        feedback(submissionId: $submissionId) {
                            text
                            log
                            code
                            attemptCount
                            score
                            originalScore
                            justificationText
                        }
                    }
                }
            }
        }
    `);
