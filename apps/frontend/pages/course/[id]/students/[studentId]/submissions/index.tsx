import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { useCourseSubmissions } from "features/submission/api/CourseSubmissions.data";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import StudentSubmissionsPage from "routes/submission/StudentSubmissionsPage";
import { Loading } from "ui/Loading";
import { useParams } from "ui/route/Params";

function StudentsSubmissions() {
    const { id } = useParams<{ id: string; studentId: string }>();
    const { data, loading } = useCourseSubmissions(id);

    if (loading) {
        return <Loading />;
    }

    // retrieve the course
    const course = data?.course;

    return (
        <RoleGuard showStaffInterface courseId={id}>
            <StudentSubmissionsPage course={course} />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <StudentsSubmissions />
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
            "submission",
        ])),
    },
});
