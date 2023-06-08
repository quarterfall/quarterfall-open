import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AdminLoginAsUserPage } from "routes/admin/AdminLoginAsUserPage";

function LoginAsUser() {
    return (
        <RoleGuard showSysAdminInterface>
            <AdminLoginAsUserPage />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <LoginAsUser />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "course",
            "notifications",
            "organization",
            "beacon",
            "admin",
        ])),
    },
});
