import { useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Course } from "interface/Course.interface";
import { User } from "interface/User.interface";

// *******************************************
// Create a course
// *******************************************

export interface CreateCourseData {
    title: string;
    code?: string;
    description?: string;
    visible?: boolean;
    startDate: Date;
    endDate: Date;
}

export const useCreateCourse = () =>
    useMutation<
        {
            createCourse: Course;
        },
        {
            input: CreateCourseData;
            defaultModuleName?: string;
        }
    >(gql`
        mutation CreateCourse(
            $input: CourseCreateInput!
            $defaultModuleName: String
        ) {
            createCourse(input: $input, defaultModuleName: $defaultModuleName) {
                id
                title
                code
                description
                archived
                modules {
                    id
                    title
                }
            }
        }
    `);

// *******************************************
// Duplicate a course
// *******************************************

export const useDuplicateCourse = () =>
    useMutation<
        {
            duplicateCourse: Course;
        },
        {
            input: {
                title: string;
                startDate: Date;
                endDate: Date;
            };
            courseId: string;
        }
    >(gql`
        mutation DuplicateCourse($input: CourseCreateInput!, $courseId: ID!) {
            duplicateCourse(input: $input, courseId: $courseId) {
                id
                title
                code
                description
                archived
                modules {
                    id
                    title
                }
            }
        }
    `);

// *******************************************
// Import course
// *******************************************

export const useImportCourse = () =>
    useMutation<{
        importCourse: Course;
    }>(gql`
        mutation importCourse($input: CourseImportInput!) {
            importCourse(input: $input) {
                id
                title
                code
                description
                archived
                startDate
                endDate
                modules {
                    id
                    title
                }
            }
        }
    `);

// *******************************************
// Read a course
// *******************************************

const courseFields = `
    id
    title
    code
    description
    archived
    visible
    demo
    library
    publicCode
    startDate
    endDate
    role
    permissions
    image
    selectedImage
    events {
        id
        createdAt
        type
        data
        metadata
    }
    modules {
        id
        title
        description
        visible
        index
        startDate
        endDate
        completed
        isOptional
        assignments {
            id
            completed
            title
            visible
            isOptional
            isStudyMaterial
            difficulty
            assessmentType
            hasGrading
            avgDifficulty
            avgUsefulness
        }
    }
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
    staff {
        id
        firstName
        lastName
        emailAddress
        courseRole(courseId: $id)
        organizationRole
        isActive(courseId: $id)
    }
    students {
        id
        firstName
        lastName
        emailAddress
        organizationRole
        isActive(courseId: $id)
    }`;

export const useCourse = (id: string) => {
    return useQuery<{
        course: Course;
    }>(
        gql`
            query Course($id: ID!) {
                course(id: $id) {
                    ${courseFields}
                }
            }
        `,
        { variables: { id } }
    );
};

export const useCourseByCode = (code: string) => {
    return useQuery<{
        courseByCode: Course;
    }>(
        gql`
            query courseByCode($code: String!) {
                courseByCode(code: $code) {
                    id
                    title
                    code
                    description
                }
            }
        `,
        { variables: { code } }
    );
};

// *******************************************
// Update course
// *******************************************

export const useUpdateCourse = () =>
    useMutation<{
        updateCourse: Course;
    }>(gql`
        mutation updateCourse($id: ID!, $input: CourseUpdateInput!) {
            updateCourse(id: $id, input: $input) {
                id
                title
                code
                description
                archived
                visible
                startDate
                endDate
                image
                selectedImage
            }
        }
    `);

// *******************************************
// Delete course
// *******************************************

export const useDeleteCourse = () =>
    useMutation<{
        deleteCourse: Course;
    }>(gql`
        mutation DeleteCourse($id: ID!) {
            deleteCourse(id: $id) {
                id
            }
        }
    `);

// *******************************************
// Accept invitation
// *******************************************

export const useAcceptInvitation = () =>
    useMutation<{
        acceptInvitation: User;
    }>(gql`
        mutation acceptInvitation($id: ID!) {
            acceptInvitation(id: $id) {
                id
                courses {
                    id
                    title
                    code
                    description
                    archived
                    role
                    permissions
                    selectedImage
                    image
                    startDate
                    endDate
                    modules {
                        id
                        title
                        completed
                    }
                }
                invitations {
                    id
                    course {
                        id
                        title
                    }
                    inviter {
                        id
                        firstName
                        lastName
                    }
                }
            }
        }
    `);

// *******************************************
// Decline invitation
// *******************************************

export const useDeclineInvitation = () =>
    useMutation<{
        declineInvitation: User;
    }>(gql`
        mutation declineInvitation($id: ID!) {
            declineInvitation(id: $id) {
                id
                invitations {
                    id
                    course {
                        id
                        title
                    }
                    inviter {
                        id
                        firstName
                        lastName
                    }
                }
            }
        }
    `);
