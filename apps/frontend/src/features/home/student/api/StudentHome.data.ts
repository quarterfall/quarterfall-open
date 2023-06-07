import { gql, useMutation } from "@apollo/client";
import { Course } from "interface/Course.interface";

export const useEnrollToCourse = () =>
    useMutation<
        {
            enrollToCourse: Course;
        },
        {
            enrollmentCode: string;
        }
    >(gql`
        mutation EnrollToCourse($enrollmentCode: String!) {
            enrollToCourse(enrollmentCode: $enrollmentCode) {
                id
                title
                description
                archived
                enrollmentCode
            }
        }
    `);
