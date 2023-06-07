import { useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { User } from "interface/User.interface";

// *******************************************
// Me
// *******************************************

interface MeData {
    me: User;
}

export const meQuery: any = gql`
    query {
        me {
            id
            firstName
            lastName
            emailAddress
            avatarName
            avatarImageLarge
            avatarImageSmall
            language
            isSysAdmin
            isStudent
            organizations {
                id
                name
            }
            organization {
                id
                name
                website
                subdomain
                role
                permissions
                appBarColor
                primaryColor
                secondaryColor
                logo
                logoMobile
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
                allowAnonymousSubmissions
                ssoProvider
                emailDomainNames
                courseAnalyticsBlockDefaults {
                    id
                    type
                    title
                    code
                    fullWidth
                }
                gradingSchemes {
                    id
                    name
                    description
                    code
                    isDefault
                }
            }
            organizationRole
            courses {
                id
                title
                code
                description
                archived
                role
                permissions
                selectedImage
                image
                startDate
                endDate
                modules {
                    id
                    title
                    completed
                    isOptional
                }
            }
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
            invitations {
                id
                course {
                    id
                    title
                }
                inviter {
                    id
                    firstName
                    lastName
                }
            }
            submissions {
                id
                submittedDate
                rating
                comment
                sticker
                score
                grade
                needsAssessment
                isTeacherTest
                isApproved
                student {
                    id
                    firstName
                    lastName
                    emailAddress
                    avatarName
                }
                assignment {
                    id
                    title
                    publicKey
                    module {
                        id
                        title
                        course {
                            id
                            archived
                        }
                    }
                }
            }
        }
    }
`;

export const useMe = (onCompleted?: (data: MeData) => void) =>
    useQuery<MeData>(meQuery, {
        onCompleted,
    });

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
