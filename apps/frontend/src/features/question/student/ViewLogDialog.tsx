import DownloadIcon from "@mui/icons-material/GetApp";
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Paper,
    Typography,
} from "@mui/material";
import { CloseIcon } from "components/icons";
import { ExitCode } from "core";
import { useTranslation } from "react-i18next";

export interface ViewLogDialogProps {
    log: string[];
    code: number;
    open: boolean;
    onClose?: () => void;
}

export function ViewLogDialog(props: ViewLogDialogProps) {
    const { log = [], code, open, onClose } = props;
    const { t } = useTranslation();

    const handleDownloadLog = () => {
        const element = document.createElement("a");
        const file = new Blob([log.join("\n")], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = "feedback.txt";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg">
            <DialogTitle>{t("assignment:logDialogTitle")}</DialogTitle>
            <DialogContent>
                <Grid container spacing={1} direction="column">
                    {code === ExitCode.NoError && (
                        <Grid item>
                            <Alert severity="success">
                                {t("assignment:resultCodeSuccess")}
                            </Alert>
                        </Grid>
                    )}
                    {code !== ExitCode.NoError && (
                        <Grid item>
                            <Alert severity="error">
                                {t("assignment:resultCodeError", { code })}
                            </Alert>
                        </Grid>
                    )}
                    <Grid item sx={{ width: "100%" }}>
                        <Paper
                            elevation={0}
                            sx={{
                                backgroundColor: "action.selected",
                                padding: 1,
                            }}
                        >
                            <Typography
                                sx={{
                                    whiteSpace: "pre-line",
                                    fontFamily: '"Fira Mono", monospace',
                                    fontSize: 12,
                                    overflow: "auto",
                                }}
                            >
                                {log.join("\n")}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleDownloadLog}
                    startIcon={<DownloadIcon />}
                >
                    {t("assignment:downloadLog")}
                </Button>
                <Button
                    onClick={onClose}
                    color="primary"
                    startIcon={<CloseIcon />}
                >
                    {t("close")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
