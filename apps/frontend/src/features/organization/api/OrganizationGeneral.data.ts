import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Organization } from "interface/Organization.interface";

// *******************************************
// Update organization
// *******************************************

export const useUpdateOrganization = () =>
    useMutation<{
        updateOrganization: Organization;
    }>(gql`
        mutation updateOrganization($id: ID, $input: OrganizationUpdateInput!) {
            updateOrganization(id: $id, input: $input) {
                id
                name
                website
                appBarColor
                primaryColor
                secondaryColor
                archived
                licenseRenewalDate
                licenseRemark
                licenseTotalStudentCredits
                licenseUsedStudentCredits
                licenseEnforceRenewalDate
                billingName
                billingPhoneNumber
                billingEmailAddress
                billingAddressLine1
                billingAddressLine2
                billingPostalCode
                billingCity
                billingCountryCode
                billingVAT
                ssoProvider
                emailDomainNames
                subdomain
            }
        }
    `);

// *******************************************
// Upload organization logos
// *******************************************

export const useUploadOrganizationLogo = () =>
    useMutation<{
        uploadOrganizationLogo: Organization;
    }>(gql`
        mutation UploadOrganizationLogo($input: FileInput!) {
            uploadOrganizationLogo(input: $input) {
                id
                logo
            }
        }
    `);

export const useUploadOrganizationLogoMobile = () =>
    useMutation<{
        uploadOrganizationLogoMobile: Organization;
    }>(gql`
        mutation UploadOrganizationLogoMobile($input: FileInput!) {
            uploadOrganizationLogoMobile(input: $input) {
                id
                logoMobile
            }
        }
    `);

// *******************************************
// Delete organization logos
// *******************************************

export const useDeleteOrganizationLogo = () =>
    useMutation<{
        deleteOrganizationLogo: Organization;
    }>(gql`
        mutation deleteOrganizationLogo {
            deleteOrganizationLogo {
                id
                logo
            }
        }
    `);

export const useDeleteOrganizationLogoMobile = () =>
    useMutation<{
        deleteOrganizationLogoMobile: Organization;
    }>(gql`
        mutation deleteOrganizationLogoMobile {
            deleteOrganizationLogoMobile {
                id
                logoMobile
            }
        }
    `);
