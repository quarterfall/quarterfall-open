import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigation } from "ui/route/Navigation";

export function LoginError() {
    const { t } = useTranslation();
    const router = useNavigation();

    const handleClickBackToHome = () => {
        router.push("/");
    };

    return (
        <Grid container direction="column" spacing={4} alignItems="center">
            <Grid item>
                <Typography variant="h6" align="center">
                    {t("auth:loginCodeExpired")}
                </Typography>
            </Grid>
            <Grid item>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleClickBackToHome}
                    startIcon={<ArrowBackIcon />}
                    fullWidth
                >
                    {t("auth:backToLogin")}
                </Button>
            </Grid>
        </Grid>
    );
}
