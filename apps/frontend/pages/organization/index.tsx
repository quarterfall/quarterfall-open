import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { OrganizationGeneralPage } from "routes/organization/OrganizationGeneralPage";

function OrganizationGeneral() {
    return (
        <RoleGuard showStaffInterface>
            <OrganizationGeneralPage />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <OrganizationGeneral />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "organization",
            "analytics",
            "admin",
        ])),
    },
});
