import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AdminOrganizationsPage } from "routes/admin/AdminOrganizationsPage";

function Admin() {
    return (
        <RoleGuard showSysAdminInterface>
            <AdminOrganizationsPage />
        </RoleGuard>
    );
}
export default () => (
    <AuthGuard>
        <Admin />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "organization",
            "beacon",
            "admin",
        ])),
    },
});
