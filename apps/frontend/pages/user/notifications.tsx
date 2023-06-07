import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { UserNotificationsPage } from "routes/user/UserNotificationsPage";

function UserNotifications() {
    return (
        <RoleGuard>
            <UserNotificationsPage />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <UserNotifications />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "beacon",
            "user",
            "roles",
            "notifications",
        ])),
    },
});
