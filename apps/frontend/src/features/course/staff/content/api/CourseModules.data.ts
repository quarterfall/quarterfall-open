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
    modules {
        id
        title
        description
        visible
        index
        startDate
        endDate
        assignments {
            id
            title
            visible
            isOptional
            isStudyMaterial
            difficulty
            assessmentType
            hasGrading
            blocks {
                id
            }
        }
    }
`;

export const useCourseModules = (id: string) => {
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
