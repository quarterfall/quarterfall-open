import { Button, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useTimeout } from "ui/hooks/Interval";

export interface LoginSuccessRedirectProps {
    next?: string;
}

export function LoginSuccessRedirect(props: LoginSuccessRedirectProps) {
    const { next = "" } = props;
    const { t } = useTranslation();

    const handleClickToDashboard = () => {
        let path = next;
        if (!path.startsWith("/")) {
            path = "/" + path;
        }

        window.location.href = window.location.origin + path;
    };

    // automatic redirect after 3 seconds
    useTimeout(handleClickToDashboard, 3000);

    return (
        <Grid container direction="column" spacing={4} alignItems="center">
            <Grid item>
                <Typography variant="h6" align="center">
                    {t("auth:alreadyAuthenticatedTitle")}
                </Typography>
            </Grid>
            <Grid item>
                <Typography
                    variant="body1"
                    align="center"
                    color="textSecondary"
                >
                    {t("auth:alreadyAuthenticatedMessage")}
                </Typography>
            </Grid>
            <Grid item>
                <Button
                    size="large"
                    color="primary"
                    variant="contained"
                    onClick={handleClickToDashboard}
                >
                    {t("continue")}
                </Button>
            </Grid>
        </Grid>
    );
}
