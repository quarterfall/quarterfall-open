import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditIcon from "@mui/icons-material/Edit";
import {
    Box,
    Button,
    Card,
    darken,
    Grid,
    Hidden,
    lighten,
} from "@mui/material";
import { useStore } from "context/UIStoreProvider";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export interface PreviewContainerProps {
    children: ReactNode;
    preview: ReactNode;
    readOnly?: boolean;
}

export function PreviewContainer(props: PreviewContainerProps) {
    const { children, preview, readOnly = false } = props;
    const { showPreview, setShowPreview } = useStore();

    const { t } = useTranslation();

    const handleTogglePreview = () => {
        setShowPreview(!showPreview);
    };

    const renderFullPreview = () => (
        <Grid container direction="column" sx={{ padding: 1 }} spacing={1}>
            {!readOnly && (
                <Grid item xs={12} style={{ textAlign: "right" }}>
                    <Button
                        onClick={handleTogglePreview}
                        startIcon={<EditIcon />}
                        size="small"
                    >
                        {t("edit")}
                    </Button>
                </Grid>
            )}
            <Grid item xs={12}>
                <Box m={1}>{preview}</Box>
            </Grid>
        </Grid>
    );

    const renderFullEditor = (mobile: boolean = false) => (
        <Grid
            container
            direction="column"
            sx={{
                backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                        ? lighten(theme.palette.background.paper, 0.15)
                        : darken(theme.palette.background.paper, 0.1),
                padding: 1,
            }}
            spacing={1}
        >
            <Grid item xs={12} style={{ textAlign: "right" }}>
                {mobile ? (
                    <Button
                        onClick={handleTogglePreview}
                        startIcon={<CheckIcon />}
                        size="small"
                    >
                        {t("done")}
                    </Button>
                ) : (
                    <Button
                        onClick={handleTogglePreview}
                        startIcon={<ChevronLeftIcon />}
                        size="small"
                    >
                        {t("showPreview")}
                    </Button>
                )}
            </Grid>
            <Grid item xs={12}>
                {children}
            </Grid>
        </Grid>
    );

    const renderEditorWithPreview = () => (
        <Grid container direction="row">
            <Grid
                item
                xs={6}
                sx={{
                    backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                            ? lighten(theme.palette.background.paper, 0.15)
                            : darken(theme.palette.background.paper, 0.1),
                    padding: 1,
                }}
            >
                <Box textAlign="right" mb={1}>
                    <Button
                        onClick={handleTogglePreview}
                        endIcon={<ChevronRightIcon />}
                        size="small"
                    >
                        {t("hidePreview")}
                    </Button>
                </Box>

                {children}
            </Grid>
            <Grid item xs={6} sx={{ padding: 1 }}>
                <Box m={1} mt={5}>
                    {preview}
                </Box>
            </Grid>
        </Grid>
    );

    return (
        <Card style={{ maxWidth: "85vw" }}>
            <Hidden mdUp>
                {readOnly || showPreview
                    ? renderFullPreview()
                    : renderFullEditor(true)}
            </Hidden>
            <Hidden mdDown>
                {readOnly && renderFullPreview()}
                {!readOnly && showPreview && renderEditorWithPreview()}
                {!readOnly && !showPreview && renderFullEditor()}
            </Hidden>
        </Card>
    );
}
