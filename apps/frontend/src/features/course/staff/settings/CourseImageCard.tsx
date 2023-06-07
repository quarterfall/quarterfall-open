import {
    Card,
    CardContent,
    CardHeader,
    Grid,
    Skeleton,
    Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import clsx from "clsx";
import { ImagePicker } from "components/image/ImagePicker";
import { courseImages, defaultCourseImage, Permission } from "core";
import { usePermission } from "hooks/usePermission";

import { useToast } from "hooks/useToast";
import { Course } from "interface/Course.interface";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Crop } from "react-image-crop";
import {
    useDeleteCourseImage,
    useUpdateCourseSettings,
    useUploadCourseImage,
} from "./api/CourseSettings.data";

const PREFIX = "CourseImageCard";

const classes = {
    placeholder: `${PREFIX}-placeholder`,
    placeholderText: `${PREFIX}-placeholderText`,
    image: `${PREFIX}-image`,
    imageDisabled: `${PREFIX}-imageDisabled`,
    imageSelected: `${PREFIX}-imageSelected`,
    uploadedImage: `${PREFIX}-uploadedImage`,
    uploadedImageOverlay: `${PREFIX}-uploadedImageOverlay`,
};

const StyledCard = styled(Card)(({ theme }) => ({
    [`& .${classes.placeholder}`]: {
        width: "240px",
        height: "135px",
        flexDirection: "column",
        borderRadius: `${theme.shape.borderRadius}px `,
    },

    [`& .${classes.placeholderText}`]: {
        margin: 0,
    },

    [`& .${classes.image}`]: {
        width: "240px",
        display: "block",
        cursor: "pointer",
        borderRadius: `${theme.shape.borderRadius}px `,
    },

    [`& .${classes.imageDisabled}`]: {
        cursor: "default",
    },

    [`& .${classes.imageSelected}`]: {
        position: "absolute",
        width: "100%",
        height: "100%",
        border: `4px solid ${theme.palette.primary.main}`,
        borderRadius: `${theme.shape.borderRadius}px `,
        backgroundColor: theme.palette.action.selected,
        zIndex: 20,
    },

    [`& .${classes.uploadedImage}`]: {
        cursor: "pointer",
        borderRadius: `${theme.shape.borderRadius}px `,
    },

    [`& .${classes.uploadedImageOverlay}`]: {
        cursor: "pointer",
        borderRadius: `${theme.shape.borderRadius}px `,
    },
}));

export interface CourseImageCardProps {
    course: Course;
    loading?: boolean;
}

export function CourseImageCard(props: CourseImageCardProps) {
    const { t } = useTranslation();
    const { course, loading } = props;
    const { showSuccessToast, showErrorToast } = useToast();
    const [selectedImage, setSelectedImage] = useState(
        course?.selectedImage || defaultCourseImage
    );

    const can = usePermission();

    const readOnly = !can(Permission.updateCourse, course);

    const [uploading, setUploading] = useState(false);
    const [uploadImageMutation] = useUploadCourseImage();
    const [deleteImageMutation] = useDeleteCourseImage();
    const [updateCourseSettingsMutation] = useUpdateCourseSettings();

    const handleSelectImage = async (image: string) => {
        if (course?.archived) {
            return;
        }
        setSelectedImage(image);
        await updateCourseSettingsMutation({
            variables: {
                id: course?.id,
                input: { selectedImage: image },
            },
        });
    };

    const handleUploadImage = async (image: Blob, crop: Crop) => {
        setUploading(true);
        try {
            await uploadImageMutation({
                variables: {
                    id: course?.id,
                    input: {
                        file: image,
                        cropX: crop.x,
                        cropY: crop.y,
                        cropWidth: crop.width,
                        cropHeight: crop.height,
                    },
                },
            });
            setSelectedImage("custom");
            showSuccessToast(t("uploadComplete"));
        } catch (error) {
            console.log(error);
            showErrorToast(t("uploadError"));
        }
        setUploading(false);
    };

    const handleDeleteImage = async () => {
        try {
            await deleteImageMutation({
                variables: {
                    id: course?.id,
                },
            });
            showSuccessToast(t("course:imageDeleted"));
            if (selectedImage === "custom") {
                setSelectedImage(defaultCourseImage);
            }
        } catch (error) {
            console.log(error);
            showErrorToast(t("unknownError"));
        }
    };

    useEffect(() => {
        setSelectedImage(course?.selectedImage || defaultCourseImage);
    }, [loading]);

    return (
        <StyledCard sx={{ width: "100%" }}>
            <CardHeader title={t("course:imageTitle")} />
            <CardContent>
                <Typography gutterBottom>{t("course:imageBody")}</Typography>
                <Grid container spacing={1}>
                    {loading &&
                        Array.from(Array(11).keys()).map(
                            (placeholder, index) => {
                                return (
                                    <Grid item key={index}>
                                        <Skeleton
                                            variant="rectangular"
                                            width={240}
                                            height={135}
                                            sx={{ borderRadius: 1 }}
                                        />
                                    </Grid>
                                );
                            }
                        )}
                    {!loading &&
                        courseImages.map((image) => (
                            <Grid item key={`image_${image}`}>
                                <div style={{ position: "relative" }}>
                                    {image === selectedImage && (
                                        <div
                                            className={classes.imageSelected}
                                        />
                                    )}

                                    <Image
                                        onClick={() => {
                                            if (!readOnly) {
                                                handleSelectImage(image);
                                            }
                                        }}
                                        width={240}
                                        height={135}
                                        className={clsx(classes.image, {
                                            [classes.imageDisabled]:
                                                course?.archived || readOnly,
                                        })}
                                        src={`/course-images/${image}.jpg`}
                                        alt={`/image/${image}.jpg`}
                                    />
                                </div>
                            </Grid>
                        ))}
                    {!loading &&
                        (!(course?.archived || readOnly) || course?.image) && (
                            <Grid item>
                                <div style={{ position: "relative" }}>
                                    {selectedImage === "custom" && (
                                        <div
                                            className={classes.imageSelected}
                                        />
                                    )}
                                    <ImagePicker
                                        disabled={course?.archived || readOnly}
                                        imageUrl={course?.image}
                                        placeholderText={t(
                                            "course:imageCustom"
                                        )}
                                        uploading={uploading}
                                        onPickImage={handleUploadImage}
                                        onDelete={handleDeleteImage}
                                        onClick={() =>
                                            handleSelectImage("custom")
                                        }
                                        classes={{
                                            placeholder: classes.placeholder,
                                            placeholderText:
                                                classes.placeholderText,
                                            image: classes.uploadedImage,
                                            imageOverlay: !course?.archived
                                                ? classes.uploadedImageOverlay
                                                : undefined,
                                        }}
                                        aspectRatio={1.78}
                                        style={{ width: 240, height: 135 }}
                                    />
                                </div>
                            </Grid>
                        )}
                </Grid>
            </CardContent>
        </StyledCard>
    );
}
