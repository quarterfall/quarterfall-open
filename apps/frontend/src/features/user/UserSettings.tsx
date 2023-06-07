import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import { ImagePicker } from "components/image/ImagePicker";
import { useAuthContext } from "context/AuthProvider";
import { ChangeEmailAddressDialog } from "features/user/change-email/ChangeEmailAddressDialog";
import { UserLayout } from "features/user/layout/UserLayout";
import {
    useDeleteUserAvatarImage,
    useUpdateMe,
    useUploadUserAvatarImage,
} from "features/user/User.data";
import { useToast } from "hooks/useToast";
import { User } from "interface/User.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";
import { TextFieldController } from "ui/form/TextFieldController";
import { PageHeading } from "ui/PageHeading";
import { useParams } from "ui/route/Params";
export function UserSettings() {
    const { me } = useAuthContext();
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const { showSuccessToast, showErrorToast } = useToast();
    const [updateMeMutation] = useUpdateMe();
    const [changeEmailAddressOpen, setChangeEmailAddressOpen] = useState(false);
    const [uploadAvatarImageMutation] = useUploadUserAvatarImage();
    const [deleteAvatarImageMutation] = useDeleteUserAvatarImage();
    const [uploading, setUploading] = useState(false);

    const {
        formState: { errors },
        control,
    } = useAutosaveForm<User>({
        defaultValues: me,
        onSave: async (input: Partial<User>) => {
            await updateMeMutation({
                variables: {
                    id,
                    input,
                },
            });
            showSuccessToast();
        },
    });

    return (
        <UserLayout selected="general">
            <Grid container direction="column" spacing={1}>
                <Grid item xs={12}>
                    <PageHeading title={t("user:personalSettingsTitle")} />
                </Grid>

                <Grid item>
                    <Paper sx={{ padding: 1 }}>
                        <form>
                            <Grid container spacing={2} direction="column">
                                {/* Image picker */}
                                <Grid item>
                                    <ImagePicker
                                        imageUrl={me.avatarImageLarge}
                                        uploading={uploading}
                                        onPickImage={async (image, crop) => {
                                            setUploading(true);
                                            try {
                                                await uploadAvatarImageMutation(
                                                    {
                                                        variables: {
                                                            input: {
                                                                file: image,
                                                                cropX: crop.x,
                                                                cropY: crop.y,
                                                                cropWidth:
                                                                    crop.width,
                                                                cropHeight:
                                                                    crop.height,
                                                            },
                                                        },
                                                    }
                                                );
                                                showSuccessToast(
                                                    t("uploadComplete")
                                                );
                                            } catch (error) {
                                                console.log(error);
                                                showErrorToast(
                                                    t("uploadError")
                                                );
                                            }
                                            setUploading(false);
                                        }}
                                        onDelete={() =>
                                            deleteAvatarImageMutation()
                                        }
                                        circular
                                        aspectRatio={1}
                                        title={t("user:avatarImage")}
                                        style={{ width: 200, height: 200 }}
                                    />
                                </Grid>
                                {/* First name */}
                                <Grid item>
                                    <TextFieldController
                                        fullWidth
                                        required
                                        label={t("user:firstName")}
                                        name="firstName"
                                        control={control}
                                    />
                                </Grid>
                                {/* Last name */}
                                <Grid item>
                                    <TextFieldController
                                        fullWidth
                                        required
                                        label={t("user:lastName")}
                                        name="lastName"
                                        control={control}
                                    />
                                </Grid>
                                {/* Email address */}
                                <Grid item>
                                    <Typography variant="caption">
                                        {t("emailAddress")}
                                    </Typography>
                                    <Box
                                        display="flex"
                                        flexDirection="row"
                                        alignItems="center"
                                    >
                                        <Typography>
                                            {me.emailAddress}
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="primary"
                                            onClick={() =>
                                                setChangeEmailAddressOpen(true)
                                            }
                                            sx={{ marginLeft: 1 }}
                                        >
                                            {t("change")}
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Grid>
            </Grid>
            <ChangeEmailAddressDialog
                open={changeEmailAddressOpen}
                onClose={() => setChangeEmailAddressOpen(false)}
            />
        </UserLayout>
    );
}
