import { Permission } from "core";
import { IOrganization } from "db/Organization";
import { Ctx, FieldResolver, Resolver, Root } from "type-graphql";
import { RequestContext } from "../../RequestContext";
import { Organization } from "./Organization";

const opt = { nullable: true };

@Resolver(Organization)
export class OrganizationLicenseResolver {
    //
    // Field resolvers
    //

    @FieldResolver((type) => Date, opt)
    public licenseRenewalDate(
        @Root() root: IOrganization,
        @Ctx() context: RequestContext
    ): Date | null {
        if (!context.can(Permission.readOrganizationLicense)) {
            return null;
        }
        return root.licenseRenewalDate;
    }

    @FieldResolver((type) => String, opt)
    public licenseRemark(
        @Root() root: IOrganization,
        @Ctx() context: RequestContext
    ): string | null {
        if (!context.can(Permission.readOrganizationLicense)) {
            return null;
        }
        return root.licenseRemark;
    }

    @FieldResolver((type) => Number, opt)
    public licenseTotalStudentCredits(
        @Root() root: IOrganization,
        @Ctx() context: RequestContext
    ): number | null {
        if (!context.can(Permission.readOrganizationLicense)) {
            return null;
        }
        return root.licenseTotalStudentCredits;
    }

    @FieldResolver((type) => Number, opt)
    public licenseUsedStudentCredits(
        @Root() root: IOrganization,
        @Ctx() context: RequestContext
    ): number | null {
        if (!context.can(Permission.readOrganizationLicense)) {
            return null;
        }
        return root.licenseUsedStudentCredits;
    }

    @FieldResolver((type) => Boolean, opt)
    public licenseEnforceRenewalDate(
        @Root() root: IOrganization,
        @Ctx() context: RequestContext
    ): boolean | null {
        if (!context.can(Permission.readOrganizationLicense)) {
            return null;
        }
        return Boolean(root.licenseEnforceRenewalDate);
    }

    @FieldResolver((type) => String, opt)
    public billingName(
        @Root() root: IOrganization,
        @Ctx() context: RequestContext
    ): string | null {
        if (!context.can(Permission.readOrganizationLicense)) {
            return null;
        }
        return root.billingName;
    }

    @FieldResolver((type) => String, opt)
    public billingPhoneNumber(
        @Root() root: IOrganization,
        @Ctx() context: RequestContext
    ): string | null {
        if (!context.can(Permission.readOrganizationLicense)) {
            return null;
        }
        return root.billingPhoneNumber;
    }

    @FieldResolver((type) => String, opt)
    public billingEmailAddress(
        @Root() root: IOrganization,
        @Ctx() context: RequestContext
    ): string | null {
        if (!context.can(Permission.readOrganizationLicense)) {
            return null;
        }
        return root.billingEmailAddress;
    }

    @FieldResolver((type) => String, opt)
    public billingAddressLine1(
        @Root() root: IOrganization,
        @Ctx() context: RequestContext
    ): string | null {
        if (!context.can(Permission.readOrganizationLicense)) {
            return null;
        }
        return root.billingAddressLine1;
    }

    @FieldResolver((type) => String, opt)
    public billingAddressLine2(
        @Root() root: IOrganization,
        @Ctx() context: RequestContext
    ): string | null {
        if (!context.can(Permission.readOrganizationLicense)) {
            return null;
        }
        return root.billingAddressLine2;
    }

    @FieldResolver((type) => String, opt)
    public billingPostalCode(
        @Root() root: IOrganization,
        @Ctx() context: RequestContext
    ): string | null {
        if (!context.can(Permission.readOrganizationLicense)) {
            return null;
        }
        return root.billingPostalCode;
    }

    @FieldResolver((type) => String, opt)
    public billingCity(
        @Root() root: IOrganization,
        @Ctx() context: RequestContext
    ): string | null {
        if (!context.can(Permission.readOrganizationLicense)) {
            return null;
        }
        return root.billingCity;
    }

    @FieldResolver((type) => String, opt)
    public billingCountryCode(
        @Root() root: IOrganization,
        @Ctx() context: RequestContext
    ): string | null {
        if (!context.can(Permission.readOrganizationLicense)) {
            return null;
        }
        return root.billingCountryCode;
    }

    @FieldResolver((type) => String, opt)
    public billingVAT(
        @Root() root: IOrganization,
        @Ctx() context: RequestContext
    ): string | null {
        if (!context.can(Permission.readOrganizationLicense)) {
            return null;
        }
        return root.billingVAT;
    }
}
