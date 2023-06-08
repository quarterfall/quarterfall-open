import {
    Box,
    Grid,
    Paper,
    PaperProps,
    Skeleton,
    Theme,
    Typography,
} from "@mui/material";
import isString from "lodash/isString";
import { ReactNode } from "react";
import { Align } from "./Align";

export interface PageHeadingProps extends PaperProps {
    loading?: boolean;
    index?: number;
    title?: string;
    description?: string | ReactNode;
    editableTitle?: string | ReactNode;
    editableSubheader?: string | ReactNode;
    actions?: ReactNode;
    readOnly?: boolean;
}

export function PageHeading(props: PageHeadingProps) {
    const {
        loading,
        index,
        title,
        description,
        editableTitle,
        editableSubheader,
        actions,
        variant = "outlined",
        square = true,
        className,
        ...rest
    } = props;

    const editableStyles = {
        marginLeft: (theme: Theme) =>
            theme.spacing(6 * (index || 0)?.toString().length),
    };

    return (
        <Paper
            sx={{
                position: "relative",
                padding: 1,
                paddingLeft: 2.5,
                width: "100%",
            }}
            data-cy="pageHeading"
            {...rest}
        >
            {loading ? (
                <Skeleton variant="rectangular" width="100%" height="40px" />
            ) : (
                <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    wrap="nowrap"
                >
                    <Grid item sx={{ flexGrow: 1 }}>
                        {index && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    left: "12px",
                                    fontSize: "80px",
                                    color: (theme) => theme.palette.grey[500],
                                    opacity: 0.2,
                                    WebkitTextStroke: (theme) =>
                                        `1px ${
                                            theme.palette.mode === "light"
                                                ? theme.palette.grey[600]
                                                : theme.palette.grey[400]
                                        }`,
                                }}
                            >
                                {index}
                            </Box>
                        )}
                        {title && <Typography variant="h4">{title}</Typography>}
                        {description && isString(description) && (
                            <Typography>{description}</Typography>
                        )}
                        {!isString(description) && <Box>{description}</Box>}
                        {editableTitle && isString(editableTitle) && (
                            <Typography variant="h4" sx={editableStyles}>
                                {editableTitle}
                            </Typography>
                        )}
                        {!isString(editableTitle) && (
                            <Box sx={editableStyles}>{editableTitle}</Box>
                        )}
                        {editableSubheader && isString(editableSubheader) && (
                            <Typography sx={editableStyles}>
                                {editableSubheader}
                            </Typography>
                        )}
                        {!isString(editableSubheader) && (
                            <Box sx={editableStyles}>{editableSubheader}</Box>
                        )}
                    </Grid>
                    {actions && (
                        <Grid item sx={{ flexGrow: 1 }}>
                            <Align right>{actions}</Align>
                        </Grid>
                    )}
                </Grid>
            )}
            <Box
                sx={{
                    position: "absolute",
                    width: "6px",
                    height: "100%",
                    top: 0,
                    left: 0,
                    backgroundColor: "secondary.main",
                    borderRadius: (theme) =>
                        `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`,
                }}
            />
        </Paper>
    );
}
