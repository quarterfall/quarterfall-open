import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { EditOrganizationAnalyticsBlockDefaultPage } from "routes/organization/OrganizationAnalyticsDefaultsPage";

function EditAnalyticsBlockDefault() {
    return (
        <RoleGuard showStaffInterface>
            <EditOrganizationAnalyticsBlockDefaultPage />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <EditAnalyticsBlockDefault />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "analytics",
            "organization",
        ])),
    },
});
