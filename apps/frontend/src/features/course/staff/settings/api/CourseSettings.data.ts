import { useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Course } from "interface/Course.interface";

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
    enrollmentCode
    startDate
    endDate
    role
    permissions
    image
    selectedImage
`;

export const useCourseSettings = (id: string) => {
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

// *******************************************
// Update course settings
// *******************************************

export const useUpdateCourseSettings = () =>
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
// Publish a course to the library
// *******************************************

export const usePublishCourseToLibrary = () =>
    useMutation<
        {
            publishCourseToLibrary: Course;
        },
        {
            courseId: string;
        }
    >(gql`
        mutation PublishCourseToLibrary($courseId: ID!) {
            publishCourseToLibrary(courseId: $courseId) {
                id
                title
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
// Upload course image
// *******************************************

export const useUploadCourseImage = () =>
    useMutation<{
        uploadCourseImage: Course;
    }>(gql`
        mutation uploadCourseImage($id: ID!, $input: FileInput!) {
            uploadCourseImage(id: $id, input: $input) {
                id
                image
                selectedImage
            }
        }
    `);

// *******************************************
// Delete course image
// *******************************************

export const useDeleteCourseImage = () =>
    useMutation<{
        deleteCourseImage: Course;
    }>(gql`
        mutation deleteCourseImage($id: ID!) {
            deleteCourseImage(id: $id) {
                id
                image
                selectedImage
            }
        }
    `);

// *******************************************
// Publish course
// *******************************************

export const usePublishCourse = () =>
    useMutation<{
        publishCourse: Course;
    }>(gql`
        mutation publishCourse($id: ID!) {
            publishCourse(id: $id) {
                id
                publicCode
            }
        }
    `);

// *******************************************
// Unpublish course
// *******************************************

export const useUnpublishCourse = () =>
    useMutation<{
        unpublishCourse: Course;
    }>(gql`
        mutation unpublishCourse($id: ID!) {
            unpublishCourse(id: $id) {
                id
                publicCode
            }
        }
    `);

// *******************************************
// Create enrollment code for course
// *******************************************

export const useCreateEnrollmentCodeForCourse = () =>
    useMutation<{
        publishCourse: Course;
    }>(gql`
        mutation createEnrollmentCodeForCourse($id: ID!) {
            createEnrollmentCodeForCourse(id: $id) {
                id
                enrollmentCode
            }
        }
    `);

// *******************************************
// Delete enrollment code from course
// *******************************************

export const useDeleteEnrollmentCodeFromCourse = () =>
    useMutation<{
        unpublishCourse: Course;
    }>(gql`
        mutation deleteEnrollmentCodeFromCourse($id: ID!) {
            deleteEnrollmentCodeFromCourse(id: $id) {
                id
                enrollmentCode
            }
        }
    `);
