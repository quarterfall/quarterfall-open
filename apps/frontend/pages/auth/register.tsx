import { RegisterPage } from "features/auth/components/RegisterPage";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function Register() {
    return <RegisterPage />;
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
