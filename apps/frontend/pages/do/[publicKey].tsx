import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { AssignmentAnonymousPage } from "routes/assignment/student/AssignmentAnonymousPage";
import { useParams } from "ui/route/Params";

export default function AssignmentAnonymous() {
    const { publicKey } = useParams<{ publicKey: string }>();

    return <AssignmentAnonymousPage publicKey={publicKey} />;
}

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "assignment",
            "submission",
        ])),
    },
});
