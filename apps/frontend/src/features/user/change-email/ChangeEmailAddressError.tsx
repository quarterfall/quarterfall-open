import { Grid, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

export function ChangeEmailAddressError() {
    const { t } = useTranslation();

    return (
        <Grid container direction="column" spacing={4} alignItems="center">
            <Grid item>
                <Typography variant="h6" align="center">
                    {t("auth:changeEmailAddressErrorText")}
                </Typography>
            </Grid>
        </Grid>
    );
}
