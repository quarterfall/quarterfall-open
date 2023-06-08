import { useAuthContext } from "context/AuthProvider";
import { useCourseByCode } from "features/course/api/Course.data";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect } from "react";
import { CourseImportAuthenticated } from "routes/course/staff/CourseImportAuthenticated";
import { Loading } from "ui/Loading";
import { useNavigation } from "ui/route/Navigation";
import { useParams } from "ui/route/Params";

function CourseImport() {
    const { code } = useParams<{ code: string }>();
    const { me } = useAuthContext();
    const { data, loading } = useCourseByCode(code);
    const router = useNavigation();

    useEffect(() => {
        if (!me) {
            router.push(`/auth/login?importCourseCode=${code}`);
        }
    });

    if (!data || loading || !me) {
        return <Loading />;
    }

    const course = data?.courseByCode;
    return <CourseImportAuthenticated course={course} code={code} />;
}

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "course",
            "auth",
        ])),
    },
});

export default CourseImport;
