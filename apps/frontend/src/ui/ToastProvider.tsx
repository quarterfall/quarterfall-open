import { IconButton, styled } from "@mui/material";
import { CloseIcon } from "components/icons";
import { useToast } from "hooks/useToast";
import { SnackbarProvider } from "notistack";
import { ReactNode } from "react";

export interface ToastProviderProps {
    children: ReactNode;
}

const PREFIX = "SnackbarItem";

const classes = {
    variantSuccess: `${PREFIX}-variantSuccess`,
    variantError: `${PREFIX}-variantError`,
    variantWarning: `${PREFIX}-variantWarning`,
    variantInfo: `${PREFIX}-variantInfo`,
};

const StyledSnackbarProvider = styled(SnackbarProvider)(({ theme }) => {
    return {
        [`&.${classes.variantSuccess}`]: {
            backgroundColor: theme.palette.success.main,
        },
        [`&.${classes.variantError}`]: {
            backgroundColor: theme.palette.error.main,
        },
        [`&.${classes.variantWarning}`]: {
            backgroundColor: theme.palette.warning.main,
        },
        [`&.${classes.variantInfo}`]: {
            backgroundColor: theme.palette.info.main,
        },
    };
});

function SnackbarCloseButton({ snackbarKey }) {
    const { closeToast } = useToast();
    return (
        <IconButton onClick={() => closeToast(snackbarKey)}>
            <CloseIcon />
        </IconButton>
    );
}

export function ToastProvider(props: ToastProviderProps) {
    return (
        <StyledSnackbarProvider
            maxSnack={3}
            autoHideDuration={3000}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            action={(snackbarKey) => (
                <SnackbarCloseButton snackbarKey={snackbarKey} />
            )}
        >
            {props.children}
        </StyledSnackbarProvider>
    );
}
