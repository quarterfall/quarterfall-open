import { ApolloClient, InMemoryCache } from "@apollo/client";
import { createUploadLink } from "apollo-upload-client";
import { config } from "config";

export const apolloClient = new ApolloClient({
    ssrMode: typeof window === "undefined", // set to true for SSR
    link: createUploadLink({
        uri: config.backend + "/graphql",
        credentials: "include",
    }),
    cache: new InMemoryCache(),
});
