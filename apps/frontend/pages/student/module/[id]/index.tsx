import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { useModule } from "features/module/staff/Module.data";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ModuleStudentHomePage } from "routes/module/student/ModuleStudentHomePage";
import { Loading } from "ui/Loading";
import { useParams } from "ui/route/Params";

function ModuleStudentHome() {
    const { id } = useParams<{ id: string }>();

    const { data, loading } = useModule(id);

    if (loading) {
        return <Loading />;
    }

    const module = data?.module;
    const course = module?.course;
    return (
        <RoleGuard showStudentInterface courseId={course?.id}>
            <ModuleStudentHomePage module={module} />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <ModuleStudentHome />
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
            "submission",
        ])),
    },
});
