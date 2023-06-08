import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AnalyticsBlockPresetEditorPage } from "routes/admin/AnalyticsBlockPresetEditorPage";

function AnalyticsBlockPresetEditor() {
    return (
        <RoleGuard showSysAdminInterface>
            <AnalyticsBlockPresetEditorPage />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <AnalyticsBlockPresetEditor />
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
        ])),
    },
});
