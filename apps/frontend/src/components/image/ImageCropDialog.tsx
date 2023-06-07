import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { centerCrop, Crop, makeAspectCrop } from "react-image-crop";
const ReactCrop = dynamic(() => import("react-image-crop"));

export interface ImageCropDialogProps {
    image?: Blob;
    open: boolean;
    aspect?: number;
    circular?: boolean;
    onClose?: (crop: Crop) => void;
    onCancel?: () => void;
}

export function ImageCropDialog(props: ImageCropDialogProps) {
    const { t } = useTranslation();
    const {
        open = true,
        onCancel,
        onClose,
        image,
        aspect,
        circular = false,
    } = props;
    const [crop, setCrop] = useState<Crop>({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        unit: "px",
    });

    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    const [xRatio, setXRatio] = useState(1);
    const [yRatio, setYRatio] = useState(1);

    function centerAspectCrop(
        mediaWidth: number,
        mediaHeight: number,
        aspect: number
    ) {
        return centerCrop(
            makeAspectCrop(
                {
                    unit: "px",
                    width: mediaWidth,
                },
                aspect,
                mediaWidth,
                mediaHeight
            ),
            mediaWidth,
            mediaHeight
        );
    }

    // helper function to clear image data
    const clearImageData = () => {
        if (imageUrl) {
            URL.revokeObjectURL(imageUrl);
            setImageUrl(undefined);
        }
        setXRatio(1);
        setYRatio(1);
    };

    // create or revoke the local image url if there is a mismatch
    const onImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height, naturalWidth, naturalHeight } = e.currentTarget;
        setXRatio(naturalWidth / width);
        setYRatio(naturalHeight / height);
        // set the crop depending on the aspect ratio and the image size
        setCrop(centerAspectCrop(width, height, aspect || width / height));

        return false; // Important when settings crop state in here.
    };

    const onEnter = () => {
        if (image && !imageUrl) {
            setImageUrl(URL.createObjectURL(image));
        }
        if (!image && imageUrl) {
            clearImageData();
        }
    };

    return (
        <Dialog open={open} onClose={onCancel} TransitionProps={{ onEnter }}>
            <DialogTitle>{t("cropImageDialogTitle")}</DialogTitle>
            <DialogContent>
                <ReactCrop
                    aspect={aspect}
                    crop={crop}
                    circularCrop={circular}
                    onChange={(c) => setCrop(c)}
                >
                    <img src={imageUrl} onLoad={onImageLoaded} />
                </ReactCrop>
            </DialogContent>
            <DialogActions>
                {onCancel && (
                    <Button
                        onClick={() => {
                            clearImageData();
                            onCancel();
                        }}
                    >
                        {t("cancel")}
                    </Button>
                )}
                {onClose && (
                    <Button
                        color="primary"
                        onClick={() => {
                            clearImageData();
                            onClose({
                                x: Math.floor((crop.x || 0) * xRatio),
                                y: Math.floor((crop.y || 0) * yRatio),
                                width: Math.floor((crop.width || 0) * xRatio),
                                height: Math.floor((crop.height || 0) * xRatio),
                                unit: "px",
                            });
                        }}
                        data-cy="imageCropDialogSubmit"
                    >
                        {t("ok")}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
