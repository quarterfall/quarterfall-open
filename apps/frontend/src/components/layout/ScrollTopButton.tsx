import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Box, Fab, useScrollTrigger, Zoom } from "@mui/material";
import { useTranslation } from "react-i18next";

export const ScrollTopButton = () => {
    const { t } = useTranslation();
    const trigger = useScrollTrigger({
        target: window,
        disableHysteresis: true,
        threshold: 200,
    });

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    };

    return (
        <>
            <Zoom in={trigger}>
                <Box
                    onClick={handleClick}
                    role="presentation"
                    sx={{
                        position: "fixed",
                        bottom: (theme) => theme.spacing(2),
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: (theme) => theme.zIndex.appBar + 1,
                    }}
                >
                    <Fab
                        aria-label="scroll back to top"
                        variant="extended"
                        color="secondary"
                    >
                        <KeyboardArrowUpIcon />
                        {t("scrollToTop")}
                    </Fab>
                </Box>
            </Zoom>
            {trigger && (
                <Box
                    sx={{
                        marginTop: (theme) => theme.spacing(10),
                        marginBottom: (theme) => theme.spacing(10),
                    }}
                />
            )}
        </>
    );
};
