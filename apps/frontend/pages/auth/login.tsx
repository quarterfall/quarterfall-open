import { LoginPage } from "features/auth/components/LoginPage";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useNavigation } from "ui/route/Navigation";

function Login() {
    const router = useNavigation();
    const next = router.query?.importCourseCode
        ? String(router.query?.importCourseCode || "")
        : String(router.query?.next || "");
    return <LoginPage next={next} />;
}

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "auth",
            "user",
        ])),
    },
});

export default Login;
