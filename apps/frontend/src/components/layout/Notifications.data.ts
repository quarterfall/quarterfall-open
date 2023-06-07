import { useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { User } from "interface/User.interface";

export const useNotifications = () =>
    useQuery<{ me: User }>(
        gql`
            query {
                me {
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
        `,
        { pollInterval: 60000 }
    );

export const useReadAllNotifications = () =>
    useMutation<{ readAllNotifications: User }>(
        gql`
            mutation {
                readAllNotifications {
                    id
                    unreadNotifications
                    notifications(limit: 5) {
                        id
                        read
                    }
                }
            }
        `
    );
