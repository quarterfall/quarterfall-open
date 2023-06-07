import { useQuery } from "@apollo/react-hooks";
import { SortingOrder } from "core";
import gql from "graphql-tag";
import { Course } from "interface/Course.interface";

// *******************************************
// Search library courses
// *******************************************

export const useSearchLibraryCourses = (variables: {
    term?: string;
    orderBy?: string;
    order?: SortingOrder;
    pageSize?: number;
    page?: number;
}) => {
    return useQuery<{
        searchLibraryCourses: {
            items: Course[];
            total: number;
        };
    }>(
        gql`
            query SearchLibraryCourses(
                $term: String
                $orderBy: String
                $order: SortingOrder
                $pageSize: Int
                $page: Int
            ) {
                searchLibraryCourses(
                    term: $term
                    orderBy: $orderBy
                    order: $order
                    pageSize: $pageSize
                    page: $page
                ) {
                    total
                    items {
                        id
                        title
                        code
                        description
                        demo
                        image
                        selectedImage
                    }
                }
            }
        `,
        {
            variables,
        }
    );
};
