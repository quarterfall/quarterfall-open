import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import OrganizationGradingPage from "routes/organization/OrganizationGradingPage";

function OrganizationGrading() {
    return (
        <RoleGuard showStaffInterface>
            <OrganizationGradingPage />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <OrganizationGrading />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "organization",
            "analytics",
        ])),
    },
});
