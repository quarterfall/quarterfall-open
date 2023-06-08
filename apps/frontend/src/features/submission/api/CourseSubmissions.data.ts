import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Course } from "interface/Course.interface";

// *******************************************
// Read a course
// *******************************************

const courseFields = `
    id
    archived
    role
    permissions
    students {
        id
        firstName
        lastName
        emailAddress
        organizationRole
        isActive(courseId: $id)
    }`;

export const useCourseSubmissions = (id: string) => {
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
