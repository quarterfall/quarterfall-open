import { CloseIcon } from "components/icons";

import { Box } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { ReactNode } from "react";

export interface DialogTitleProps {
    children: ReactNode;
    onClose?: () => void;
}

export function DialogTitle(props: DialogTitleProps) {
    const { children, onClose } = props;

    return (
        <Box sx={{ padding: (theme) => theme.spacing(2, 3) }}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton
                    aria-label="Close"
                    sx={{
                        position: "absolute",
                        right: 0.5,
                        top: 0.5,
                        color: (theme) => theme.palette.grey[500],
                    }}
                    onClick={onClose}
                    size="large"
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </Box>
    );
}
