import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { OrganizationLicensePage } from "routes/organization/OrganizationLicensePage";

function OrganizationLicense() {
    return (
        <RoleGuard showStaffInterface>
            <OrganizationLicensePage />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <OrganizationLicense />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "beacon",
            "organization",
            "analytics",
            "admin",
        ])),
    },
});
