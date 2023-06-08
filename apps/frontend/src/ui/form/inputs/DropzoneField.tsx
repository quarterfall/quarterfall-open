import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Alert, Box, Stack, styled, Typography } from "@mui/material";
import clsx from "clsx";
import { useState } from "react";
import Dropzone, { DropzoneProps } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { Loading } from "../../Loading";

const PREFIX = "Dropzone";

const classes = {
    root: `${PREFIX}-root`,
    active: `${PREFIX}-active`,
    disabled: `${PREFIX}-disabled`,
    invalid: `${PREFIX}-invalid`,
};

const StyledContainer = styled(Box)(({ theme }) => {
    return {
        "@keyframes progress": {
            "0%": {
                backgroundPosition: "0 0",
            },
            "100%": {
                backgroundPosition: "-70px 0",
            },
        },
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: theme.spacing(8),
        border: `2px dashed ${theme.palette.text.primary}`,
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.paper,
        outline: "none",
        position: "relative",
        transition: "all .24s ease-in-out",
        "&:hover": {
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.action.hover,
            cursor: "pointer",
        },
        "&:focus": {
            borderColor: theme.palette.primary.main,
        },
        [`&.${classes.active}`]: {
            animation: "$progress 2s linear infinite !important",
            backgroundImage: `repeating-linear-gradient(-45deg, ${theme.palette.background.paper}, ${theme.palette.background.paper} 25px, ${theme.palette.divider} 25px, ${theme.palette.divider} 50px)`,
            backgroundSize: "150% 100%",
            border: "solid",
            borderColor: theme.palette.primary.light,
        },
        [`&.${classes.disabled}`]: {
            backgroundColor: theme.palette.action.disabledBackground,
            "&:hover": {
                backgroundColor: theme.palette.action.disabledBackground,
                borderColor: theme.palette.text.primary,
                cursor: "default",
            },
        },
        [`&.${classes.invalid}`]: {
            backgroundImage: `repeating-linear-gradient(-45deg, ${theme.palette.error.light}, ${theme.palette.error.light} 25px, ${theme.palette.error.dark} 25px, ${theme.palette.error.dark} 50px)`,
            borderColor: theme.palette.error.main,
        },
    };
});

interface DropzoneFieldProps extends DropzoneProps {
    handleChange: (e) => void;
    label: string;
    uploading?: boolean;
    allowedFileTypes?: string;
}

export const DropzoneField = (props: DropzoneFieldProps) => {
    const {
        handleChange,
        label,
        uploading,
        allowedFileTypes,
        ...dropzoneProps
    } = props;
    const { t } = useTranslation();
    const [rejectedFiles, setRejectedFiles] = useState([]);

    const disabled = uploading;

    return (
        <Dropzone
            {...dropzoneProps}
            onDropAccepted={(accFiles) => {
                setRejectedFiles([]);
                handleChange(accFiles);
            }}
            onDropRejected={(rejFiles) => setRejectedFiles(rejFiles)}
            disabled={disabled}
        >
            {({ getRootProps, getInputProps, isDragActive, isDragReject }) => (
                <Stack spacing={2}>
                    <StyledContainer
                        {...getRootProps({
                            className: clsx(
                                isDragActive && classes.active,
                                isDragReject && classes.invalid,
                                disabled && classes.disabled
                            ),
                        })}
                    >
                        <input
                            {...getInputProps({
                                disabled,
                                accept: allowedFileTypes,
                            })}
                        />

                        {uploading ? (
                            <Loading text={t("uploading")} />
                        ) : (
                            <Box
                                sx={{
                                    textAlign: "center",
                                }}
                            >
                                <CloudUploadIcon
                                    sx={{
                                        width: 51,
                                        height: 51,
                                        color: "text.primary",
                                    }}
                                />
                                <Typography
                                    variant="h5"
                                    component="p"
                                    sx={{
                                        marginBottom: 3,
                                        marginTop: 3,
                                    }}
                                >
                                    {label}
                                </Typography>
                            </Box>
                        )}
                    </StyledContainer>
                    {rejectedFiles?.length > 1 && (
                        <Alert
                            color="error"
                            onClose={() => setRejectedFiles([])}
                        >
                            {t("too-many-files")}
                        </Alert>
                    )}
                    {rejectedFiles?.length < 2 &&
                        rejectedFiles.map((f, index) => {
                            return (
                                <Alert
                                    color="error"
                                    onClose={() =>
                                        setRejectedFiles(
                                            rejectedFiles.filter(
                                                (file) => file !== f
                                            )
                                        )
                                    }
                                    key={index}
                                >
                                    {f?.errors?.flatMap((e) =>
                                        t(e.code, {
                                            file: f?.file?.name,
                                        })
                                    )}
                                </Alert>
                            );
                        })}
                </Stack>
            )}
        </Dropzone>
    );
};
