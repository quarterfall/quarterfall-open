import { useMutation, useQuery } from "@apollo/react-hooks";
import { SortingOrder } from "core";
import gql from "graphql-tag";
import { Course } from "interface/Course.interface";
import { User } from "interface/User.interface";

// *******************************************
// Update me
// *******************************************

export const useUpdateMe = () =>
    useMutation<User>(gql`
        mutation updateMe($input: UserUpdateInput!) {
            updateMe(input: $input) {
                id
                firstName
                lastName
                avatarName
                language
            }
        }
    `);

export const useRequestChangeEmailAddress = () =>
    useMutation<User>(gql`
        mutation requestChangeEmailAddress($emailAddress: String!) {
            requestChangeEmailAddress(emailAddress: $emailAddress)
        }
    `);

export const useCompleteChangeEmailAddress = () =>
    useMutation<boolean, { token: string }>(gql`
        mutation CompleteChangeEmailAddress($token: String!) {
            completeChangeEmailAddress(token: $token)
        }
    `);

// *******************************************
// Upload user avatar image
// *******************************************

export const useUploadUserAvatarImage = () =>
    useMutation<{
        uploadUserAvatarImage: User;
    }>(gql`
        mutation UploadUserAvatarImage($input: FileInput!) {
            uploadUserAvatarImage(input: $input) {
                id
                avatarImageOriginal
                avatarImageLarge
                avatarImageSmall
            }
        }
    `);

// *******************************************
// Delete user avatar image
// *******************************************

export const useDeleteUserAvatarImage = () =>
    useMutation<{
        deleteUserAvatarImage: User;
    }>(gql`
        mutation DeleteUserAvatarImage {
            deleteUserAvatarImage {
                id
                avatarImageOriginal
                avatarImageLarge
                avatarImageSmall
            }
        }
    `);

// *******************************************
// Read a course student data
// *******************************************

export const useSearchCourses = (variables: {
    term?: string;
    orderBy?: string;
    order?: SortingOrder;
    pageSize?: number;
    page?: number;
    allCourses?: boolean;
    hideArchived?: boolean;
}) =>
    useQuery<{
        searchCourses: {
            items: Course[];
            total: number;
        };
    }>(
        gql`
            query SearchCourses(
                $term: String
                $orderBy: String
                $order: SortingOrder
                $pageSize: Int
                $page: Int
                $allCourses: Boolean
                $hideArchived: Boolean
            ) {
                searchCourses(
                    term: $term
                    orderBy: $orderBy
                    order: $order
                    pageSize: $pageSize
                    page: $page
                    allCourses: $allCourses
                    hideArchived: $hideArchived
                ) {
                    total
                    items {
                        id
                        title
                        code
                        description
                        startDate
                        endDate
                        archived
                        demo
                        image
                        selectedImage
                        role
                        permissions
                        studentCount
                    }
                }
            }
        `,
        {
            variables,
        }
    );
