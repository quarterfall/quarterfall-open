import ArrowForward from "@mui/icons-material/ArrowForward";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Alert, Avatar, Button, Grid, Typography } from "@mui/material";
import axios, { AxiosError, AxiosResponse } from "axios";
import { CardImageLayout } from "components/layout/CardImageLayout";
import { config } from "config";
import { useAuthContext } from "context/AuthProvider";
import { LoggedInRedirect } from "features/auth/components/LoggedInRedirect";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TextFieldController } from "ui/form/TextFieldController";
import { useNavigation } from "ui/route/Navigation";
import { useQueryParams } from "ui/route/QueryParams";
import { WaitingOverlay } from "ui/WaitingOverlay";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));

interface QueryParams {
    emailAddress: string;
    next: string;
    enrollmentCode?: string;
}

interface RegisterData {
    firstName: string;
    lastName: string;
    emailAddress: string;
    language?: string;
    enrollmentCode?: string;
    next?: string;
}

enum FormState {
    Error,
    Success,
    None,
}

export interface RegisterPageProps {}

export function RegisterPage(props: RegisterPageProps) {
    const [waiting, setWaiting] = useState(false);
    const { me } = useAuthContext();
    const { t, i18n } = useTranslation();
    const [params] = useQueryParams<QueryParams>({
        emailAddress: "",
        next: "/",
        enrollmentCode: "",
    });
    const router = useNavigation();

    const [formState, setFormState] = useState(FormState.None);

    const { handleSubmit, control } = useForm<RegisterData>({
        defaultValues: {
            emailAddress: params.emailAddress,
            enrollmentCode: params.enrollmentCode,
        },
    });

    const onSubmit = async (input: RegisterData) => {
        setFormState(FormState.None);
        input.language = i18n.language;
        setWaiting(true);
        await axios({
            method: "POST",
            data: {
                input,
            },
            withCredentials: true,
            url: config.backend + "/register",
            headers: { "Content-Type": "application/json" },
        })
            .then((res: AxiosResponse) => {
                if (res?.data?.success) {
                    setFormState(FormState.Success);
                }
                setWaiting(false);
            })
            .catch((error: AxiosError) => {
                setFormState(FormState.Error);
                setWaiting(false);
            });
    };

    // if the user is already logged in, display the redirect page
    if (me) {
        return <LoggedInRedirect />;
    }

    return (
        <CardImageLayout image={`/background_login.jpg`}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2} direction="column">
                    <Grid item>
                        <Grid
                            container
                            alignItems="center"
                            direction="column"
                            spacing={2}
                        >
                            <Grid item>
                                <Avatar
                                    sx={{
                                        backgroundColor: (theme) =>
                                            theme.palette.secondary.main,
                                        width: 65,
                                        height: 65,
                                    }}
                                >
                                    <LockOutlinedIcon fontSize="large" />
                                </Avatar>
                            </Grid>
                        </Grid>
                    </Grid>
                    {formState === FormState.Error && (
                        <Grid item xs={12}>
                            <Alert severity="error">{t("unknownError")}</Alert>
                        </Grid>
                    )}

                    {formState === FormState.Success && (
                        <Grid item xs={12}>
                            <Alert severity="success">
                                {t("auth:startRegistrationSuccess")}
                            </Alert>
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <TextFieldController
                            fullWidth
                            label={t("emailAddress")}
                            name="emailAddress"
                            control={control}
                            autoFocus={!params.emailAddress}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography gutterBottom>
                            {t("auth:registerBody")}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <TextFieldController
                            fullWidth
                            label={t("user:firstName")}
                            name="firstName"
                            control={control}
                            required
                            autoFocus={Boolean(params.emailAddress)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextFieldController
                            fullWidth
                            label={t("user:lastName")}
                            name="lastName"
                            control={control}
                            required
                        />
                    </Grid>

                    {router.asPath.includes("enrollmentCode") && (
                        <Grid item xs={12}>
                            <TextFieldController
                                fullWidth
                                label={t("enrollmentCode")}
                                name="enrollmentCode"
                                control={control}
                            />
                        </Grid>
                    )}

                    <Grid item>
                        <WaitingOverlay waiting={waiting}>
                            <Button
                                color="primary"
                                variant="contained"
                                size="large"
                                type="submit"
                                fullWidth
                                endIcon={<ArrowForward />}
                                disabled={
                                    waiting || formState === FormState.Success
                                }
                            >
                                {t("auth:register")}
                            </Button>
                        </WaitingOverlay>
                    </Grid>
                    <Grid item>
                        <Markdown dense linkTarget="_blank">
                            {t("auth:registrationDisclaimer")}
                        </Markdown>
                    </Grid>
                </Grid>
            </form>
        </CardImageLayout>
    );
}
