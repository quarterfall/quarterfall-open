import { Box, Grid, Typography } from "@mui/material";
import { Layout } from "components/layout/Layout";
import React from "react";

function NotFound() {
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
                        <Typography variant="h3">
                            404 - Page Not Found
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        </Layout>
    );
}

export default NotFound;
