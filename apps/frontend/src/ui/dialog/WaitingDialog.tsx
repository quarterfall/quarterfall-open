import {
    CircularProgress,
    Dialog,
    DialogContent,
    Grid,
    Typography,
} from "@mui/material";

export interface WaitingDialogProps {
    open: boolean;
    message: string;
}

export function WaitingDialog(props: WaitingDialogProps) {
    const { open, message } = props;

    return (
        <Dialog open={open}>
            <DialogContent>
                <Grid
                    container
                    spacing={2}
                    direction="column"
                    alignItems="center"
                >
                    <Grid item xs>
                        <Typography variant="h6">{message}</Typography>
                    </Grid>
                    {/* Circular progress */}
                    <Grid item xs>
                        <CircularProgress />
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
}
