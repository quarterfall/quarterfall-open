import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AdminOrganizationPage } from "routes/admin/AdminOrganizationPage";
import { useParams } from "ui/route/Params";

function OrganizationAdmin() {
    const { id } = useParams<{ id: string }>();

    return (
        <RoleGuard showSysAdminInterface>
            <AdminOrganizationPage id={id} tab="users" />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <OrganizationAdmin />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "organization",
            "admin",
            "user",
            "roles",
        ])),
    },
});
