import axios from "axios";
import { CardImageLayout } from "components/layout/CardImageLayout";
import { config } from "config";
import { useAuthContext } from "context/AuthProvider";
import { useEffect, useState } from "react";
import { Align } from "ui/Align";
import { Loading } from "ui/Loading";
import { useQueryParams } from "ui/route/QueryParams";
import { LoginError } from "./LoginError";
import { LoginSuccessRedirect } from "./LoginSuccessRedirect";

interface QueryParams {
    next: string;
}

enum LoginStatus {
    Error,
    Success,
    Waiting,
}

export interface AuthCompletePageProps {
    token: string;
}

export function AuthCompletePage(props: AuthCompletePageProps) {
    const { token } = props;
    const [status, setStatus] = useState(LoginStatus.Waiting);
    const { me } = useAuthContext();
    const [params] = useQueryParams<QueryParams>({
        next: "/",
    });

    const doCompleteLogin = async () => {
        let url =
            config.backend +
            `/login/magic/complete?token=${encodeURIComponent(token)}`;

        // complete the login process
        await axios({
            method: "GET",
            url,
            withCredentials: true,
        })
            .then((res) => {
                setStatus(LoginStatus.Success);
            })
            .catch((error) => {
                setStatus(LoginStatus.Error);
            });
    };

    useEffect(() => {
        doCompleteLogin();
    }, []);

    const renderContent = () => {
        if (me || status === LoginStatus.Success) {
            return <LoginSuccessRedirect next={params.next} />;
        } else if (status === LoginStatus.Error) {
            return <LoginError />;
        } else {
            return (
                <Align>
                    <Loading />
                </Align>
            );
        }
    };
    return (
        <CardImageLayout image={`/background_login.jpg`}>
            {renderContent()}
        </CardImageLayout>
    );
}
