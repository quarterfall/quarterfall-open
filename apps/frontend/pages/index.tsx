import { useAuthContext } from "context/AuthProvider";
import { RoleType } from "core";
import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { HomeStaff } from "features/home/staff/components/HomeStaff";
import { HomeStudent } from "features/home/student/components/HomeStudent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

function Index() {
    const { me } = useAuthContext();
    const isOrganizationStaff =
        me?.organizationRole === RoleType.organizationAdmin ||
        me?.organizationRole === RoleType.organizationStaff;

    return (
        <RoleGuard showStaffInterface={isOrganizationStaff}>
            {isOrganizationStaff ? <HomeStaff /> : <HomeStudent />}
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <Index />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "course",
            "roles",
            "assignment",
            "submission",
            "organization",
            "user",
        ])),
    },
});
