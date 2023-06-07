import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AdminUsersPage } from "routes/admin/AdminUsersPage";

function Users() {
    return (
        <RoleGuard showSysAdminInterface>
            <AdminUsersPage />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <Users />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "admin",
            "roles",
            "user",
        ])),
    },
});
