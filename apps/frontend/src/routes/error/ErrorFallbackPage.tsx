import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Layout } from "components/layout/Layout";
import { useAuthContext } from "context/AuthProvider";
import { detect } from "detect-browser";
import { useReportError } from "hooks/useReportError";
import { useEffect } from "react";
import { FallbackProps } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { useNavigation } from "ui/route/Navigation";

type ErrorFallbackPageProps = FallbackProps & {};

export const ErrorFallbackPage = (props: ErrorFallbackPageProps) => {
    const { t } = useTranslation();
    const { error } = props;
    const browser = detect();
    const [reportErrorMutation] = useReportError();
    const router = useNavigation();
    const { me } = useAuthContext();

    const handleClickReportBug = () => {
        window.open("https://github.com/quarterfall/quarterfall-open/issues");
    };

    useEffect(() => {
        reportErrorMutation({
            variables: {
                input: {
                    browserName: browser.name,
                    browserVersion: browser.version,
                    browserOS: browser.os,
                    errorUrl: router.asPath,
                    errorName: error.name,
                    errorMessage: error.message,
                    errorCause: error.cause,
                    errorStack: error.stack,
                    userId: me?.id,
                },
            },
        });
    }, [error]);

    return (
        <Layout>
            <Box
                minHeight="85vh"
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                <Stack direction="column" spacing={4} alignItems="center">
                    <Stack direction="column" spacing={1} alignItems="center">
                        <Typography variant="h4">
                            {t("somethingWentWrong")}
                        </Typography>
                        <Typography variant="subtitle1">
                            {t("errorHasBeenReported")}
                        </Typography>
                    </Stack>
                    <Button
                        color="primary"
                        variant="contained"
                        startIcon={<LiveHelpIcon />}
                        size="large"
                        onClick={handleClickReportBug}
                    >
                        {t("reportBug")}
                    </Button>
                </Stack>
            </Box>
        </Layout>
    );
};
