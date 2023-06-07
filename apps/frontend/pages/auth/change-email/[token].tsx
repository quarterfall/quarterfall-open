import { CompleteChangeEmailAddressPage } from "features/user/change-email/CompleteChangeEmailAddressPage";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useParams } from "ui/route/Params";

export default function ConfirmChangeEmail() {
    const { token } = useParams<{ token: string }>();
    return <CompleteChangeEmailAddressPage token={token} />;
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
