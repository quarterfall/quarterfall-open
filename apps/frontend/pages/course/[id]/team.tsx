import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { CourseTeamPage } from "routes/course/staff/CourseTeamPage";
import { useParams } from "ui/route/Params";

function CourseStudents() {
    const { id } = useParams<{ id: string }>();

    return (
        <RoleGuard showStaffInterface courseId={id}>
            <CourseTeamPage />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <CourseStudents />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "roles",
            "user",
            "course",
        ])),
    },
});
