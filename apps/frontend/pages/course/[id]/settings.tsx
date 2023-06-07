import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { CourseSettingsPage } from "routes/course/staff/CourseSettingsPage";
import { useParams } from "ui/route/Params";

function CourseSettings() {
    const { id } = useParams<{ id: string }>();

    return (
        <RoleGuard showStaffInterface courseId={id}>
            <CourseSettingsPage />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <CourseSettings />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "course",
            "admin",
        ])),
    },
});
