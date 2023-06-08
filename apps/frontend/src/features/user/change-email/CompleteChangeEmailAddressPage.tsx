import { CircularProgress } from "@mui/material";
import { CardImageLayout } from "components/layout/CardImageLayout";
import React, { useEffect, useState } from "react";
import { useCompleteChangeEmailAddress } from "../User.data";
import { ChangeEmailAddressError } from "./ChangeEmailAddressError";
import { ChangeEmailAddressSuccess } from "./ChangeEmailAddressSuccess";

enum RequestStatus {
    Error,
    Success,
    Waiting,
}

export interface CompleteChangeEmailAddressPageProps {
    token: string;
}
export function CompleteChangeEmailAddressPage(
    props: CompleteChangeEmailAddressPageProps
) {
    const { token } = props;
    const [status, setStatus] = useState(RequestStatus.Waiting);
    const [completeChangeEmailAddress] = useCompleteChangeEmailAddress();

    const doCompleteChangeEmailAddress = async () => {
        // complete the login process
        try {
            await completeChangeEmailAddress({ variables: { token } });
            setStatus(RequestStatus.Success);
        } catch (error) {
            console.log(error);
            setStatus(RequestStatus.Error);
        }
    };

    useEffect(() => {
        doCompleteChangeEmailAddress();
    }, []);

    const renderContent = () => {
        if (status === RequestStatus.Success) {
            return <ChangeEmailAddressSuccess />;
        } else if (status === RequestStatus.Error) {
            return <ChangeEmailAddressError />;
        } else {
            return <CircularProgress />;
        }
    };
    return (
        <CardImageLayout image={`/background_login.jpg`}>
            {renderContent()}
        </CardImageLayout>
    );
}
