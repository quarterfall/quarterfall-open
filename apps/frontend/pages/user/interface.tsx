import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { UserInterfaceSettingsPage } from "routes/user/UserInterfaceSettingsPage";

function UserInterface() {
    return (
        <RoleGuard>
            <UserInterfaceSettingsPage />
        </RoleGuard>
    );
}
export default () => (
    <AuthGuard>
        <UserInterface />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "user",
            "languages",
            "roles",
        ])),
    },
});
