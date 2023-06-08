import { AuthCompletePage } from "features/auth/components/AuthCompletePage";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useParams } from "ui/route/Params";

export default function AuthCompleteRoute() {
    const { token } = useParams<{ token: string }>();
    return <AuthCompletePage token={token} />;
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
