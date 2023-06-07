import { Box, Hidden, Paper } from "@mui/material";
import { ImageLayout } from "components/layout/ImageLayout";
import { ReactNode } from "react";

export interface CardImageLayoutProps {
    image: string;
    children: ReactNode;
}

export function CardImageLayout(props: CardImageLayoutProps) {
    const { image, children } = props;

    return (
        <ImageLayout image={image}>
            <Hidden smUp>
                <Box mt={3}>{children}</Box>
            </Hidden>
            <Hidden smDown>
                <Box display="flex" justifyContent="center">
                    <Paper sx={{ width: "500px", padding: 3, marginTop: 3 }}>
                        {children}
                    </Paper>
                </Box>
            </Hidden>
        </ImageLayout>
    );
}
