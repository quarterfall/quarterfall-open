import { RoleType, gradingSchemeDefaults } from "core";
import { DBAnalyticsBlock } from "db/AnalyticsBlock";
import { DBGradingScheme } from "db/GradingScheme";
import { DBOrganization } from "db/Organization";
import { DBRole } from "db/Role";
import { DBUser } from "db/User";
import { Types } from "mongoose";

interface CreateOrganizationOptions {
    name: string;
    emailAddress: string;
}

export default async function createOrganization(
    options: CreateOrganizationOptions
) {
    const { name, emailAddress } = options;
    // create a organization
    const organization = await DBOrganization.create({
        name,
    });

    // check whether the user already exists
    let user = await DBUser.findOne({
        emailAddress,
    });

    // if the user doesn't exist, create one
    if (!user) {
        console.log(
            `Creating a new admin user with email address ${emailAddress}.`
        );
        user = await DBUser.create({
            organizations: [organization._id],
            emailAddress,
            isSysAdmin: true,
        });
    }

    // create the organization admin role
    await DBRole.create({
        organizationId: organization._id,
        userId: user._id,
        subjectId: organization._id,
        role: RoleType.organizationAdmin,
        name,
    });

    // add default grading schemes to the organization
    await Promise.all(
        gradingSchemeDefaults.map(async (scheme) => {
            const newScheme = { ...scheme, id: undefined };
            await new DBGradingScheme({
                ...newScheme,
                organizationId: organization?.id,
            }).save();
        })
    );

    await organization.save();

    console.log(`A new organization has been created.`, { organization });

    // create the organization admin role
    await new DBRole({
        organizationId: organization._id,
        userId: user._id,
        subjectId: organization._id,
        role: RoleType.organizationAdmin,
        active: true,
    }).save();

    // add the organization to the user's organization list
    user.organizations = user.organizations || [];
    user.organizations.push(organization._id);
    await user.save();

    console.log(`A new organization admin role has been created.`, {
        user,
        organization,
    });
}
