import { useMutation, useQuery } from "@apollo/react-hooks";
import { SortingOrder } from "core";
import gql from "graphql-tag";
import { Organization } from "interface/Organization.interface";
import { User } from "interface/User.interface";

// *******************************************
// Search organizations (sys admin only)
// *******************************************

export const useSearchOrganizations = (variables: {
    term?: string;
    orderBy?: string;
    order?: SortingOrder;
    pageSize?: number;
    page?: number;
    showArchived?: boolean;
}) => {
    return useQuery<{
        searchOrganizations: {
            items: Organization[];
            total: number;
        };
    }>(
        gql`
            query SearchOrganizations(
                $term: String
                $orderBy: String
                $order: SortingOrder
                $pageSize: Int
                $page: Int
                $showArchived: Boolean
            ) {
                searchOrganizations(
                    term: $term
                    orderBy: $orderBy
                    order: $order
                    pageSize: $pageSize
                    page: $page
                    showArchived: $showArchived
                ) {
                    total
                    items {
                        id
                        createdAt
                        name
                        archived
                        admins {
                            id
                            emailAddress
                        }
                    }
                }
            }
        `,
        {
            variables,
        }
    );
};

// Retrieving organization information

export const useOrganization = (id: string) => {
    return useQuery<{
        organization: Organization;
    }>(
        gql`
            query Organization($id: ID!) {
                organization(id: $id) {
                    id
                    createdAt
                    name
                    website
                    archived
                    licenseRenewalDate
                    licenseRemark
                    licenseTotalStudentCredits
                    licenseUsedStudentCredits
                    licenseEnforceRenewalDate
                    ssoProvider
                    emailDomainNames
                    admins {
                        id
                        firstName
                        lastName
                        emailAddress
                    }
                }
            }
        `,
        {
            variables: { id },
        }
    );
};

// *******************************************
// Search all users (sys admin only)
// *******************************************

export const useSearchAllUsers = (variables: {
    term?: string;
    orderBy?: string;
    order?: SortingOrder;
    pageSize?: number;
    page?: number;
}) => {
    return useQuery<{
        searchAllUsers: {
            items: User[];
            total: number;
        };
    }>(
        gql`
            query SearchAllUsers(
                $term: String
                $orderBy: String
                $order: SortingOrder
                $pageSize: Int
                $page: Int
            ) {
                searchAllUsers(
                    term: $term
                    orderBy: $orderBy
                    order: $order
                    pageSize: $pageSize
                    page: $page
                ) {
                    total
                    items {
                        id
                        firstName
                        lastName
                        emailAddress
                        organizations {
                            id
                            name
                        }
                    }
                }
            }
        `,
        {
            variables,
        }
    );
};

// Creating an organization

export const useCreateOrganization = () =>
    useMutation<
        {
            createOrganization: Organization;
        },
        {
            input: { name: string; emailAddress: string };
        }
    >(gql`
        mutation createOrganization($input: OrganizationCreateInput!) {
            createOrganization(input: $input) {
                id
            }
        }
    `);

// Deleting an organization

export const useDeleteOrganization = () =>
    useMutation<{
        deleteOrganization: Organization;
    }>(gql`
        mutation deleteOrganization($id: ID!) {
            deleteOrganization(id: $id) {
                id
            }
        }
    `);
