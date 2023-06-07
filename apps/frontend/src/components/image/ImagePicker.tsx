import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    Grid,
    IconButton,
    LinearProgress,
    Typography,
    useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import clsx from "clsx";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Crop } from "react-image-crop";
import { RatioBox } from "ui/RatioBox";
import { ConfirmationDialog } from "../../ui/dialog/ConfirmationDialog";
import { ImageCropDialog } from "./ImageCropDialog";

const PREFIX = "ImagePicker";

const classes = {
    wrapper: `${PREFIX}-wrapper`,
    image: `${PREFIX}-image`,
    imageCircle: `${PREFIX}-imageCircle`,
    placeholderCircle: `${PREFIX}-placeholderCircle`,
    placeholderRect: `${PREFIX}-placeholderRect`,
    placeholderIcon: `${PREFIX}-placeholderIcon`,
    placeholderText: `${PREFIX}-placeholderText`,
    placeholderDisabled: `${PREFIX}-placeholderDisabled`,
    actionIcon: `${PREFIX}-actionIcon`,
    overlay: `${PREFIX}-overlay`,
    overlayCircle: `${PREFIX}-overlayCircle`,
    loadingOverlay: `${PREFIX}-loadingOverlay`,
    title: `${PREFIX}-title`,
};

const Root = styled("div")(({ theme }) => {
    return {
        [`&.${classes.wrapper}`]: {
            position: "relative",
            overflow: "hidden",
            display: "block",
        },
        [`& .${classes.image}`]: {
            display: "block", // removes the bottom space below image
            maxWidth: "100%",
            maxHeight: "100%",
            width: "100%",
            height: "100%",
            borderRadius: "4px",
            minWidth: "48px",
            minHeight: "48px",
        },
        [`& .${classes.imageCircle}`]: {
            borderRadius: "50%",
            display: "block", // removes the bottom space below image
            maxWidth: "100%",
            maxHeight: "100%",
            width: "100%",
            height: "100%",
            minWidth: "48px",
            minHeight: "48px",
        },
        [`& .${classes.placeholderCircle}`]: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            borderRadius: "50%",
            cursor: "pointer",
            border: "2px dashed",
            "&:hover": { backgroundColor: theme.palette.action.hover },
        },
        [`& .${classes.placeholderRect}`]: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            borderRadius: "4px",
            cursor: "pointer",
            border: "2px dashed",
            "&:hover": { backgroundColor: theme.palette.action.hover },
        },
        [`& .${classes.placeholderIcon}`]: {
            fontSize: "48px",
        },
        [`& .${classes.placeholderText}`]: {
            marginLeft: 2,
        },
        [`& .${classes.placeholderDisabled}`]: {
            cursor: "default",
            "&:hover": { backgroundColor: "transparent" },
        },
        [`& .${classes.actionIcon}`]: {
            color: "white",
            zIndex: 10,
        },
        [`& .${classes.overlay}`]: {
            background: "rgba(0, 0, 0, 0.2)",
            position: "absolute",
            bottom: 0,
            left: 0,
            padding: 0,
            margin: 0,
            width: "100%",
            height: "100%",
            color: "white",
            zIndex: 100,
        },
        [`& .${classes.overlayCircle}`]: {
            background: "rgba(0, 0, 0, 0.2)",
            borderBottomLeftRadius: "100% 200%",
            borderBottomRightRadius: "100% 200%",
            borderBottomColor: "transparent",
            borderLeftColor: "transparent",
            position: "absolute",
            bottom: 0,
            left: 0,
            padding: 0,
            margin: 0,
            width: "100%",
            height: "50%",
            color: "white",
            zIndex: 100,
        },
        [`& .${classes.loadingOverlay}`]: {
            position: "absolute",
            bottom: 0,
            width: "100%",
        },
        [`& .${classes.title}`]: {
            paddingLeft: 1,
        },
    };
});

interface ImagePickerProps {
    /** called when the image changes. Provides the loaded image as a Blob. */
    onPickImage?: (image: Blob, crop: Crop) => void;
    /** called when the user presses the delete icon (only on non-circular image picker) */
    onDelete?: () => void;
    /** onclick handler (only active when a placeholder is not shown) */
    onClick?: () => void;
    /** disables the image picker */
    disabled?: boolean;
    /** Optional title to display on top of the image (only on non-circular image picker) */
    title?: string;
    /** placeholder color */
    color?: "default" | "primary" | "secondary";
    /** the current image url */
    imageUrl?: string;
    /** image to show when this component is empty */
    placeholderImageUrl?: string;
    /** text to show when this component is empty (only if no image is provided) */
    placeholderText?: string;
    /** whether we are currently uploading */
    uploading?: boolean;
    /** Whether the placeholder is a circle */
    circular?: boolean;
    /** optional fixed aspect ratio */
    aspectRatio?: number;
    /** class applied to the wrapper div */
    className?: string;
    /** style applied to the wrapper div */
    style?: React.CSSProperties;
    classes?: {
        // extra class applied to the image placeholder
        placeholder?: string;
        // extra class applied to the placeholder text
        placeholderText?: string;
        // extra class applied to the image
        image?: string;
        // extra class applied to the image overlay
        imageOverlay?: string;
    };
}

/** Component to pick images. Can upload directly and return imageId or keep images local and return Blobs */
export function ImagePicker(props: ImagePickerProps) {
    const [imageCropDialogOpen, setImageCropDialogOpen] = useState(false);
    const [confirmDeleteImageOpen, setConfirmDeleteImageOpen] = useState(false);
    const [image, setImage] = useState<Blob | undefined>(undefined);
    // reference to the input
    const inputRef = useRef<HTMLInputElement>(null);

    const { t } = useTranslation();
    const theme = useTheme();
    const {
        onPickImage,
        onDelete,
        onClick,
        disabled = false,
        uploading = false,
        circular = false,
        imageUrl,
        placeholderImageUrl = "",
        placeholderText = "",
        className,
        style,
        classes: propsClasses,
        aspectRatio,
        title,
        color = "default",
    } = props;

    const getThemeColor = () => {
        switch (color) {
            case "primary":
                return theme.palette.primary.main;
            case "secondary":
                return theme.palette.secondary.main;
            default:
                return theme.palette.text.primary;
        }
    };

    const handleClickDeleteImage = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.stopPropagation();
        setConfirmDeleteImageOpen(true);
    };

    const handleDeleteImage = () => {
        setConfirmDeleteImageOpen(false);
        setImage(undefined);
        // call the delete handler
        if (onDelete) {
            onDelete();
        }
    };

    const handlePickImage = (crop: Crop) => {
        setImageCropDialogOpen(false);
        if (onPickImage && image) {
            onPickImage(image, crop);
        }
    };

    const handleCancelChangeImage = () => {
        setImageCropDialogOpen(false);
        setImage(undefined);
    };

    const handleChangeImage = (event) => {
        if (disabled || event.target.files.length <= 0) {
            return; // no files were selected or the picker is disabled
        }
        // store the image
        setImage(event.target.files[0]);
        // open the image cropping dialog
        setImageCropDialogOpen(true);
    };

    const openFilePicker = () => {
        if (disabled) {
            return;
        }
        if (inputRef.current) {
            inputRef.current.value = "";
            inputRef.current.click();
        }
    };

    const renderPlaceholder = () => {
        if (placeholderImageUrl) {
            return (
                <img
                    src={placeholderImageUrl}
                    className={clsx(
                        circular
                            ? classes.placeholderCircle
                            : classes.placeholderRect,
                        propsClasses?.placeholder,
                        { [classes.placeholderDisabled]: disabled }
                    )}
                    onClick={openFilePicker}
                />
            );
        } else {
            return (
                <RatioBox
                    ratio={aspectRatio}
                    className={clsx(
                        circular
                            ? classes.placeholderCircle
                            : classes.placeholderRect,
                        propsClasses?.placeholder,
                        { [classes.placeholderDisabled]: disabled }
                    )}
                    onClick={openFilePicker}
                    style={{
                        borderColor: getThemeColor(),
                    }}
                >
                    <AddAPhotoIcon
                        className={classes.placeholderIcon}
                        style={{ color: getThemeColor() }}
                    />
                    {placeholderText && (
                        <Typography
                            variant="h6"
                            className={clsx(
                                classes.placeholderText,
                                propsClasses?.placeholderText
                            )}
                            style={{ color: getThemeColor() }}
                        >
                            {placeholderText}
                        </Typography>
                    )}
                </RatioBox>
            );
        }
    };

    return (
        <Root className={clsx(classes.wrapper, className)} style={style}>
            {/* Image input */}
            <input
                hidden
                type="file"
                ref={inputRef}
                accept=".png,.jpg,.jpeg"
                onChange={handleChangeImage}
            />
            {/* Either show image (selected or placeholder) or an upload icon */}
            {imageUrl ? (
                <img
                    onClick={onClick}
                    src={imageUrl}
                    className={clsx(
                        {
                            [classes.image]: !circular,
                            [classes.imageCircle]: circular,
                        },
                        propsClasses?.image
                    )}
                />
            ) : (
                renderPlaceholder()
            )}
            {/* Image overlay with title delete button (non-circular) */}
            {!uploading && !circular && imageUrl && (
                <Grid
                    container
                    direction="row"
                    justifyContent={title ? "space-between" : "flex-end"}
                    alignItems="center"
                    className={clsx(
                        classes.overlay,
                        propsClasses?.imageOverlay
                    )}
                    onClick={onClick}
                >
                    {title && (
                        <Grid item>
                            <Typography variant="h6" className={classes.title}>
                                {title}
                            </Typography>
                        </Grid>
                    )}
                    <Grid item>
                        <IconButton
                            color="inherit"
                            name="delete"
                            disabled={disabled}
                            onClick={handleClickDeleteImage}
                            size="large"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            )}
            {/* Image overlay with title and delete button (circular) */}
            {!uploading && circular && imageUrl && (
                <Grid
                    container
                    direction="column"
                    justifyContent="flex-end"
                    alignItems="center"
                    className={clsx(
                        classes.overlayCircle,
                        propsClasses?.imageOverlay
                    )}
                >
                    {title && (
                        <Grid item>
                            <Typography variant="h6" className={classes.title}>
                                {title}
                            </Typography>
                        </Grid>
                    )}
                    <Grid item>
                        <IconButton
                            color="inherit"
                            name="delete"
                            onClick={handleClickDeleteImage}
                            disabled={disabled}
                            size="large"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            )}
            {/* Show linear progress while uploading */}
            {uploading && (
                <div className={classes.loadingOverlay}>
                    <LinearProgress color="secondary" />
                </div>
            )}
            {/* image crop dialog */}
            <ImageCropDialog
                open={imageCropDialogOpen}
                onClose={handlePickImage}
                onCancel={handleCancelChangeImage}
                image={image}
                aspect={aspectRatio}
                circular={circular}
            />
            {/* Delete image confirmation dialog */}
            <ConfirmationDialog
                open={confirmDeleteImageOpen}
                title={t("confirmDeleteImageTitle")}
                message={t("confirmDeleteImageBody")}
                onCancel={() => setConfirmDeleteImageOpen(false)}
                onContinue={handleDeleteImage}
            />
        </Root>
    );
}
