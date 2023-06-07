import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AnalyticsPresetsPage } from "routes/admin/AnalyticsPresetsPage";

function AnalyticsPresets() {
    return (
        <RoleGuard showSysAdminInterface>
            <AnalyticsPresetsPage />
        </RoleGuard>
    );
}
export default () => (
    <AuthGuard>
        <AnalyticsPresets />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "admin",
            "analytics",
            "assignment",
        ])),
    },
});
