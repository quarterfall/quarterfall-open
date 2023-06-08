import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AdminLibraryPage } from "routes/admin/AdminLibraryPage";

function Library() {
    return (
        <RoleGuard showSysAdminInterface>
            <AdminLibraryPage />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <Library />
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
