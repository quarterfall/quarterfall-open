import { useLazyQuery } from "@apollo/react-hooks";
import { SortingOrder } from "core";
import gql from "graphql-tag";
import { Submission } from "interface/Submission.interface";

// *******************************************
// Search submissions
// *******************************************

export const useSearchSubmissions = () => {
    return useLazyQuery<
        {
            searchSubmissions: SearchSubmissionResults;
        },
        {
            courseId: string;
            moduleIds?: string[];
            assignmentIds?: string[];
            userIds?: string[];
            hideApproved?: boolean;
            term?: string;
            orderBy?: string;
            order?: SortingOrder;
            pageSize?: number;
            page?: number;
        }
    >(
        gql`
            query SearchSubmissions(
                $courseId: ID!
                $moduleIds: [ID!]
                $assignmentIds: [ID!]
                $userIds: [ID!]
                $hideApproved: Boolean
                $hideUnapproved: Boolean
                $pageSize: Int
                $page: Int
                $orderBy: String
                $order: SortingOrder
                $term: String
            ) {
                searchSubmissions(
                    courseId: $courseId
                    moduleIds: $moduleIds
                    assignmentIds: $assignmentIds
                    userIds: $userIds
                    hideApproved: $hideApproved
                    hideUnapproved: $hideUnapproved
                    pageSize: $pageSize
                    page: $page
                    orderBy: $orderBy
                    order: $order
                    term: $term
                ) {
                    total
                    items {
                        id
                        comment
                        rating
                        sticker
                        submittedDate
                        isApproved
                        isTeacherTest
                        score
                        grade
                        student {
                            id
                            firstName
                            lastName
                            emailAddress
                            avatarImageSmall
                            avatarName
                        }
                        assignment {
                            id
                            title
                            hasSubmissions

                            submissionCount
                            hasGrading
                            unapprovedSubmissionCount
                            module {
                                id
                                title
                                course {
                                    id
                                    archived
                                }
                            }
                            blocks {
                                id
                                feedback {
                                    score
                                }
                            }
                        }
                    }
                }
            }
        `,
        { fetchPolicy: "network-only" }
    );
};

interface SearchSubmissionResults {
    items: Submission[];
    total: number;
}
