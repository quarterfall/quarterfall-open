import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { CourseContentPage } from "routes/course/staff/CourseContentPage";
import { useParams } from "ui/route/Params";

function CourseContent() {
    const { id } = useParams<{ id: string }>();

    return (
        <RoleGuard showStaffInterface courseId={id}>
            <CourseContentPage />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <CourseContent />
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
        ])),
    },
});
