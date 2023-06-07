import { Box, Grid, Typography } from "@mui/material";
import { Layout } from "components/layout/Layout";
import React from "react";
import { useTranslation } from "react-i18next";

interface AccessErrorPageProps {
    text?: string;
}

export function AccessErrorPage(props: AccessErrorPageProps) {
    const { text } = props;
    const { t } = useTranslation();

    const displayText = text || t ? t("accessError") : "";
    return (
        <Layout>
            <Box
                minHeight="85vh"
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                <Grid
                    container
                    direction="column"
                    spacing={1}
                    alignItems="center"
                >
                    <Grid item>
                        <Typography variant="h4">{displayText}</Typography>
                    </Grid>
                </Grid>
            </Box>
        </Layout>
    );
}
