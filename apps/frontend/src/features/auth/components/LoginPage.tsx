import LoginIcon from "@mui/icons-material/ArrowForward";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
    Alert,
    Avatar,
    Button,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import axios, { AxiosError, AxiosResponse } from "axios";
import { CardImageLayout } from "components/layout/CardImageLayout";
import { config } from "config";
import { useAuthContext } from "context/AuthProvider";
import { patterns } from "core";
import { LoggedInRedirect } from "features/auth/components/LoggedInRedirect";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { useLocalStorage } from "ui/hooks/LocalStorage";
import { Link } from "ui/Link";
import { useNavigation } from "ui/route/Navigation";
import { useQueryParams } from "ui/route/QueryParams";
import { WaitingOverlay } from "ui/WaitingOverlay";

interface LoginData {
    emailAddress: string;
}

interface QueryParams {
    emailAddress: string;
}

enum FormState {
    Error,
    NotFound,
    SSOLoginSuccess,
    MagicLoginSuccess,
    None,
}

export interface LoginPageProps {
    next?: string;
}

export function LoginPage(props: LoginPageProps) {
    const { next = "/" } = props;
    const [waiting, setWaiting] = useState(false);
    const [params] = useQueryParams<QueryParams>({
        emailAddress: "",
    });
    const [emailAddress, setEmailAddress] = useLocalStorage(
        "login_default_emailAddress"
    );
    const router = useNavigation();
    const { me } = useAuthContext();

    const startLogin = async (input: LoginData) => {
        await axios({
            method: "POST",
            data: {
                emailAddress: input.emailAddress,
                next,
            },
            withCredentials: true,
            url: config.backend + "/login",
            headers: { "Content-Type": "application/json" },
        })
            .then((res: AxiosResponse) => {
                if (res?.data?.success) {
                    if (res?.data?.ssoUrl) {
                        setFormState(FormState.SSOLoginSuccess);
                        router.push(res?.data?.ssoUrl);
                    } else {
                        setFormState(FormState.MagicLoginSuccess);
                    }
                    setWaiting(false);
                }
            })
            .catch((error: AxiosError) => {
                if (error.response.status === 404) {
                    setFormState(FormState.NotFound);
                } else {
                    setFormState(FormState.Error);
                }
                setWaiting(false);
            });
    };

    const { t } = useTranslation();
    const [formState, setFormState] = useState(FormState.None);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: { emailAddress: emailAddress || params.emailAddress },
    });

    const onSubmit = async (input: LoginData) => {
        setFormState(FormState.None);
        setWaiting(true);

        setEmailAddress(input.emailAddress);
        await startLogin(input);

        setWaiting(false);
    };

    // if the user is already logged in, display the redirect page
    if (me) {
        return <LoggedInRedirect />;
    }

    return (
        <CardImageLayout image={`/background_login.jpg`}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2} alignItems="center">
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
                    {formState === FormState.Error && (
                        <Alert severity="error">{t("unknownError")}</Alert>
                    )}
                    {formState === FormState.NotFound && (
                        <Alert severity="error">{t("userNotFound")}</Alert>
                    )}
                    {formState === FormState.MagicLoginSuccess && (
                        <Alert severity="success">
                            {t("auth:startMagicLoginSuccess")}
                        </Alert>
                    )}
                    {formState === FormState.SSOLoginSuccess && (
                        <Alert severity="success">
                            {t("auth:startSSOLoginSuccess")}
                        </Alert>
                    )}
                    {/* Email address */}
                    <TextField
                        required
                        {...register("emailAddress", {
                            required: true,
                            pattern: {
                                value: patterns.email,
                                message: t("validationErrorEmailAddress"),
                            },
                        })}
                        disabled={
                            formState === FormState.MagicLoginSuccess ||
                            formState === FormState.SSOLoginSuccess
                        }
                        autoFocus
                        fullWidth
                        type="email"
                        label={t("emailAddress")}
                        variant="outlined"
                        error={Boolean(errors?.emailAddress)}
                        helperText={errors?.emailAddress?.message}
                        placeholder={t("enterEmailAddress")}
                    />

                    {/* Login button */}
                    <WaitingOverlay waiting={waiting} style={{ width: "100%" }}>
                        <Button
                            color="primary"
                            variant="contained"
                            size="large"
                            type="submit"
                            fullWidth
                            endIcon={<LoginIcon />}
                            disabled={
                                waiting ||
                                formState === FormState.MagicLoginSuccess ||
                                formState === FormState.SSOLoginSuccess
                            }
                        >
                            {t("continue")}
                        </Button>
                    </WaitingOverlay>

                    <Link
                        to={`/auth/register?enrollmentCode=`}
                        sx={{
                            color: (theme) =>
                                theme.palette.mode === "dark"
                                    ? "primary.light"
                                    : "primary.dark",
                        }}
                    >
                        <Align center>
                            <Typography
                                variant="caption"
                                sx={{ textAlign: "center" }}
                            >
                                {t("auth:registerWithEnrollmentCode")}
                            </Typography>
                        </Align>
                    </Link>
                </Stack>
            </form>
        </CardImageLayout>
    );
}
