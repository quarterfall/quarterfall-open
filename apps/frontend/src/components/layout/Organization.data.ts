import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Organization } from "interface/Organization.interface";

// *******************************************
// Start trial
// *******************************************

export const useSwitchToOrganization = () =>
    useMutation<{
        switchToOrganization: Organization;
    }>(gql`
        mutation SwitchToOrganization($id: ID!) {
            switchToOrganization(id: $id) {
                id
            }
        }
    `);
