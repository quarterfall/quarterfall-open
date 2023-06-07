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
    library
    role
    permissions
    image
    selectedImage
`;

export const useCourseLayoutData = (id: string) => {
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
