import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Course } from "interface/Course.interface";

// *******************************************
// Read a course
// *******************************************

const courseFields = `
    id
    title
    archived
    role
    permissions
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
    students {
        id
        createdAt
        firstName
        lastName
        emailAddress
        organizationRole
        isActive(courseId: $id)
    }`;

export const useCourseAnalytics = (id: string) => {
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
