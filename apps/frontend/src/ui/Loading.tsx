import { Box, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface LoadingProps {
    text?: string;
}

export function Loading(props: LoadingProps) {
    const { text } = props;
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                padding: "40px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <CircularProgress />
            <Typography
                sx={{
                    marginTop: "20px",
                    textAlign: "center",
                    fontFamily: "Poppins",
                }}
            >
                {text || t("pageLoading")}
            </Typography>
        </Box>
    );
}
