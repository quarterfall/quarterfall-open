import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { OrganizationUsersPage } from "routes/organization/OrganizationUsersPage";

function OrganizationUsers() {
    return (
        <RoleGuard showStaffInterface>
            <OrganizationUsersPage />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <OrganizationUsers />
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
            "roles",
            "user",
        ])),
    },
});
