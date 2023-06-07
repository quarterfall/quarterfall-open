import { useMutation, useQuery } from "@apollo/react-hooks";
import { RoleType, SortingOrder } from "core";
import gql from "graphql-tag";
import { Course } from "interface/Course.interface";
import { User } from "interface/User.interface";

// *******************************************
// Search course users
// *******************************************

export const useSearchCourseUsers = (variables: {
    courseId: string;
    term?: string;
    orderBy?: string;
    order?: SortingOrder;
    pageSize?: number;
    page?: number;
    hasRoleFilter?: boolean;
    roles?: RoleType[];
}) => {
    return useQuery<{
        searchCourseUsers: {
            users: User[];
            total: number;
        };
    }>(
        gql`
            query SearchCourseUsers(
                $courseId: ID!
                $term: String
                $orderBy: String
                $order: SortingOrder
                $pageSize: Int
                $page: Int
                $roles: [RoleType!]
            ) {
                searchCourseUsers(
                    courseId: $courseId
                    term: $term
                    orderBy: $orderBy
                    order: $order
                    pageSize: $pageSize
                    page: $page
                    roles: $roles
                ) {
                    total
                    users {
                        id
                        firstName
                        lastName
                        emailAddress
                        courseRole(courseId: $courseId)
                        organizationRole
                    }
                }
            }
        `,
        {
            variables,
        }
    );
};

// *******************************************
// Add course users
// *******************************************

export const useAddCourseUsers = () =>
    useMutation<{
        addCourseUsers: Course;
    }>(gql`
        mutation AddCourseUsers(
            $id: ID!
            $users: [UserCreateInput!]!
            $role: RoleType
        ) {
            addCourseUsers(id: $id, users: $users, role: $role) {
                id
                students {
                    id
                }
                staff {
                    id
                }
            }
        }
    `);

// *******************************************
// Remove course users
// *******************************************

export const useRemoveCourseUsers = () =>
    useMutation<{
        removeCourseUsers: Course;
    }>(gql`
        mutation RemoveCourseUsers($id: ID!, $users: [ID!]!) {
            removeCourseUsers(id: $id, users: $users) {
                id
                staff {
                    id
                }
                students {
                    id
                }
            }
        }
    `);

// *******************************************
// Edit course user role
// *******************************************

export const useEditCourseUserRole = () =>
    useMutation<{
        editCourseUserRole: Course;
    }>(gql`
        mutation EditCourseUserRole($id: ID!, $userId: ID!, $role: RoleType!) {
            editCourseUserRole(id: $id, userId: $userId, role: $role) {
                id
                staff {
                    id
                    firstName
                    lastName
                    emailAddress
                    courseRole(courseId: $id)
                    isActive(courseId: $id)
                }
            }
        }
    `);
