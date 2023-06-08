import { useMutation, useQuery } from "@apollo/react-hooks";
import { RoleType, SortingOrder } from "core";
import gql from "graphql-tag";
import { Organization } from "interface/Organization.interface";
import { User } from "interface/User.interface";

// *******************************************
// Search organization users
// *******************************************

export const useSearchOrganizationUsers = (variables: {
    term?: string;
    orderBy?: string;
    order?: SortingOrder;
    pageSize?: number;
    page?: number;
    id?: string;
    roles?: RoleType[];
}) => {
    return useQuery<{
        searchOrganizationUsers: {
            users: User[];
            total: number;
        };
    }>(
        gql`
            query SearchOrganizationUsers(
                $term: String
                $orderBy: String
                $order: SortingOrder
                $pageSize: Int
                $page: Int
                $id: ID
                $roles: [RoleType!]
            ) {
                searchOrganizationUsers(
                    term: $term
                    orderBy: $orderBy
                    order: $order
                    pageSize: $pageSize
                    page: $page
                    id: $id
                    roles: $roles
                ) {
                    total
                    users {
                        id
                        firstName
                        lastName
                        emailAddress
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
// Add organization users
// *******************************************

export const useAddOrganizationUsers = () =>
    useMutation<{
        addOrganizationUsers: Organization;
    }>(gql`
        mutation AddOrganizationUsers(
            $users: [UserCreateInput!]!
            $role: RoleType
        ) {
            addOrganizationUsers(users: $users, role: $role) {
                id
            }
        }
    `);

// *******************************************
// Remove organization users
// *******************************************

export const useRemoveOrganizationUsers = () =>
    useMutation<{
        removeOrganizationUsers: Organization;
    }>(gql`
        mutation RemoveOrganizationUsers($users: [ID!]!) {
            removeOrganizationUsers(users: $users) {
                id
            }
        }
    `);

// *******************************************
// Update organization user
// *******************************************

export const useUpdateUser = () =>
    useMutation<{
        updateUser: User;
    }>(gql`
        mutation UpdateUser($id: ID!, $input: UserUpdateInput!) {
            updateUser(id: $id, input: $input) {
                id
                firstName
                lastName
            }
        }
    `);
