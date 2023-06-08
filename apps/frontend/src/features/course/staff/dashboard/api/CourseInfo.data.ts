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
    visible
    startDate
    endDate
    role
    permissions
    students {
        id
        isActive(courseId: $id)
    }
    staff {
        id
        isActive(courseId: $id)
    }
    modules {
        id
        assignments {
            id
        }
    }
    
`;

export const useCourseInfo = (id: string) => {
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
