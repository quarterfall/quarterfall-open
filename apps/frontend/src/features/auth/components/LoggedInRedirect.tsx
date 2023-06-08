import { Box, Button, Grid, Hidden, Paper, Typography } from "@mui/material";
import { ImageLayout } from "components/layout/ImageLayout";
import { useTranslation } from "react-i18next";
import { useTimeout } from "ui/hooks/Interval";

export function LoggedInRedirect() {
    const { t } = useTranslation();

    const handleClickToDashboard = () => {
        window.location.href = window.location.origin;
    };

    // automatic redirect after 3 seconds
    useTimeout(handleClickToDashboard, 3000);

    const renderContent = () => (
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

    return (
        <ImageLayout image={`/background_login.jpg`}>
            <Hidden smUp>
                <Box sx={{ padding: (theme) => theme.spacing(4, 2, 0) }}>
                    {renderContent()}
                </Box>
            </Hidden>
            <Hidden smDown>
                <Box display="flex" justifyContent="center">
                    <Paper
                        sx={{
                            width: 500,
                            padding: (theme) => theme.spacing(8, 4, 6),
                            marginTop: (theme) => theme.spacing(3),
                        }}
                    >
                        {renderContent()}
                    </Paper>
                </Box>
            </Hidden>
        </ImageLayout>
    );
}
