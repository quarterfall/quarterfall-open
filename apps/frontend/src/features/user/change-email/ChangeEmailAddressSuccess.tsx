import { Button, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useTimeout } from "ui/hooks/Interval";

export function ChangeEmailAddressSuccess() {
    const { t } = useTranslation();

    const handleClickToDashboard = () => {
        window.location.href = window.location.origin;
    };

    // automatic redirect after 3 seconds
    useTimeout(handleClickToDashboard, 3000);

    return (
        <Grid container direction="column" spacing={4} alignItems="center">
            <Grid item>
                <Typography
                    variant="body1"
                    align="center"
                    color="textSecondary"
                >
                    {t("auth:emailAddressChangedMessage")}
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
