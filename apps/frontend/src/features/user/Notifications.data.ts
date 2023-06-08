import { useMutation, useQuery } from "@apollo/react-hooks";
import { SortingOrder } from "core";
import gql from "graphql-tag";
import { Notification } from "interface/Notification.interface";
import { User } from "interface/User.interface";

// *******************************************
// Read a course student data
// *******************************************

export const useSearchNotifications = (variables: {
    orderBy?: string;
    order?: SortingOrder;
    pageSize?: number;
    page?: number;
}) =>
    useQuery<{
        searchNotifications: {
            notifications: Notification[];
            total: number;
        };
    }>(
        gql`
            query SearchNotifications(
                $orderBy: String
                $order: SortingOrder
                $pageSize: Int
                $page: Int
            ) {
                searchNotifications(
                    orderBy: $orderBy
                    order: $order
                    pageSize: $pageSize
                    page: $page
                ) {
                    total
                    notifications {
                        id
                        type
                        read
                        createdAt
                        text
                        link
                        actor {
                            id
                            avatarName
                            avatarImageSmall
                        }
                        metadata
                    }
                }
            }
        `,
        {
            variables,
            pollInterval: 60000,
        }
    );

export const useReadAllNotifications = () =>
    useMutation<{ readAllNotifications: User }>(
        gql`
            mutation {
                readAllNotifications {
                    id
                    unreadNotifications
                    notifications {
                        id
                        read
                    }
                }
            }
        `
    );

export const useDeleteNotifications = () =>
    useMutation<{ deleteNotifications: User }, { ids: string[] }>(
        gql`
            mutation deleteNotifications($ids: [ID!]) {
                deleteNotifications(ids: $ids) {
                    id
                    unreadNotifications
                    notifications(limit: 5) {
                        id
                        type
                        read
                        createdAt
                        text
                        link
                        actor {
                            id
                            avatarName
                            avatarImageSmall
                        }
                        metadata
                    }
                }
            }
        `
    );
