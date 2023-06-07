import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { useModule } from "features/course/staff/content/api/Module.data";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ModuleSettingsPage } from "routes/module/staff/ModuleSettingsPage";
import { Loading } from "ui/Loading";
import { useParams } from "ui/route/Params";

function ModuleSettings() {
    const { id } = useParams<{ id: string }>();
    const { data, loading } = useModule(id);

    if (loading) {
        return <Loading />;
    }

    const module = data?.module;
    const course = module?.course;

    return (
        <RoleGuard showStaffInterface courseId={course?.id}>
            <ModuleSettingsPage module={module} />
        </RoleGuard>
    );
}

export default () => (
    <AuthGuard>
        <ModuleSettings />
    </AuthGuard>
);

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "module",
        ])),
    },
});
