import { Divider, Grid, Typography } from "@mui/material";
import * as React from "react";

export interface DividerTextProps {
    text: string;
}

export function DividerText(props: DividerTextProps) {
    const { text } = props;

    return (
        <Grid
            container
            direction="row"
            wrap="nowrap"
            alignItems="center"
            spacing={1}
        >
            <Grid item xs>
                <Divider />
            </Grid>
            <Grid item>
                <Typography color="inherit" variant="overline">
                    {text}
                </Typography>
            </Grid>
            <Grid item xs>
                <Divider />
            </Grid>
        </Grid>
    );
}
