import { gql, useQuery } from "@apollo/client";
import { Course } from "interface/Course.interface";

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

export const useCourseStudents = (id: string) => {
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
