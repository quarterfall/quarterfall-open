import { DBOrganization } from "db/Organization";

export const organizationHasSSO = async (user) => {
    if (!user) {
        return false;
    }
    // Filter if organization has SSO
    const organizations = await DBOrganization.find({
        id: { $in: user?.organizations.map((org) => org?.id) },
        ssoProvider: { $exists: true },
        emailDomainNames: { $exists: true },
    });

    return (organizations || []).find((o) =>
        o?.emailDomainNames?.includes(user?.emailAddress.split("@")[1])
    );
};
