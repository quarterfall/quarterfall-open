import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { CourseDashboardPage } from "routes/course/staff/CourseDashboardPage";
import { useParams } from "ui/route/Params";

function CourseDashboard() {
    const { id } = useParams<{ id: string }>();

    return (
        <RoleGuard showStaffInterface courseId={id}>
            <CourseDashboardPage />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <CourseDashboard />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "assignment",
            "course",
            "module",
            "organization",
            "analytics",
        ])),
    },
});
