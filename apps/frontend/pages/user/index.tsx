import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { UserSettings } from "features/user/UserSettings";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

function UserSettingsPage() {
    return (
        <RoleGuard>
            <UserSettings />
        </RoleGuard>
    );
}
export default () => (
    <AuthGuard>
        <UserSettingsPage />
    </AuthGuard>
);
export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "auth",
            "user",
            "roles",
        ])),
    },
});
