import { Card, CardContent, CardHeader, Grid, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ImagePicker } from "components/image/ImagePicker";
import { colors } from "config";
import { useAuthContext } from "context/AuthProvider";
import { Permission } from "core";
import {
    useDeleteOrganizationLogo,
    useDeleteOrganizationLogoMobile,
    useUpdateOrganization,
    useUploadOrganizationLogo,
    useUploadOrganizationLogoMobile,
} from "features/organization/api/OrganizationGeneral.data";
import { OrganizationInfoCard } from "features/organization/info/OrganizationInfoCard";
import { OrganizationLayout } from "features/organization/layout/OrganizationLayout";
import { usePermission } from "hooks/usePermission";
import { useToast } from "hooks/useToast";
import { Organization } from "interface/Organization.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Crop } from "react-image-crop";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { useAutosaveForm } from "ui/form/Autosave";
import { ColorPickerFieldController } from "ui/form/ColorPickerFieldController";
import { PageHeading } from "ui/PageHeading";
const PREFIX = "OrganizationGeneralPage";

const classes = {
    placeholder: `${PREFIX}-placeholder`,
    placeholderMobile: `${PREFIX}-placeholderMobile`,
};

const StyledDesktopImagePicker = styled(ImagePicker)(() => ({
    [`& .${classes.placeholder}`]: {
        width: 320,
        height: 80,
    },
}));

const StyledMobileImagePicker = styled(ImagePicker)(() => ({
    [`& .${classes.placeholderMobile}`]: {
        width: 200,
        height: 200,
        flexDirection: "column",
    },
}));

export function OrganizationGeneralPage() {
    const { t } = useTranslation();
    const { me } = useAuthContext();
    const [updateOrganizationMutation] = useUpdateOrganization();
    const [uploadLogoMutation] = useUploadOrganizationLogo();
    const [uploadLogoMobileMutation] = useUploadOrganizationLogoMobile();
    const [deleteLogoMutation] = useDeleteOrganizationLogo();
    const [deleteLogoMobileMutation] = useDeleteOrganizationLogoMobile();
    const { showSuccessToast, showErrorToast } = useToast();
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingLogoMobile, setUploadingLogoMobile] = useState(false);

    const can = usePermission();

    // Form for the organization editor
    const { control } = useAutosaveForm<Partial<Organization>>({
        delay: 0,
        onSave: async (input) => {
            await updateOrganizationMutation({
                variables: {
                    input,
                },
            });
            showSuccessToast();
        },
        defaultValues: {
            ...me?.organization,
            appBarColor: me?.organization?.appBarColor || colors.appBar,
            primaryColor: me?.organization?.primaryColor || colors.primary,
            secondaryColor:
                me?.organization?.secondaryColor || colors.secondary,
        },
    });

    const handleUploadLogo = async (image: Blob, crop: Crop) => {
        setUploadingLogo(true);
        try {
            await uploadLogoMutation({
                variables: {
                    input: {
                        file: image,
                        cropX: crop.x,
                        cropY: crop.y,
                        cropWidth: crop.width,
                        cropHeight: crop.height,
                    },
                },
            });
            showSuccessToast(t("uploadComplete"));
        } catch (error) {
            console.log(error);
            showErrorToast(t("uploadError"));
        }
        setUploadingLogo(false);
    };

    const handleUploadLogoMobile = async (image: Blob, crop: Crop) => {
        setUploadingLogoMobile(true);
        try {
            await uploadLogoMobileMutation({
                variables: {
                    input: {
                        file: image,
                        cropX: crop.x,
                        cropY: crop.y,
                        cropWidth: crop.width,
                        cropHeight: crop.height,
                    },
                },
            });
            showSuccessToast(t("uploadComplete"));
        } catch (error) {
            console.log(error);
            showErrorToast(t("uploadError"));
        }
        setUploadingLogoMobile(false);
    };

    if (!can(Permission.updateOrganization)) {
        return <AccessErrorPage />;
    }

    return (
        <OrganizationLayout selected="general">
            <form>
                <Grid container direction="column" spacing={1}>
                    <Grid item xs={12}>
                        <PageHeading title={t("organization:aboutCardTitle")} />
                    </Grid>
                    <Grid item xs={12}>
                        <OrganizationInfoCard organization={me.organization} />
                    </Grid>
                    <Grid item xs={12}>
                        <Card>
                            <CardHeader title={t("organization:branding")} />
                            <CardContent>
                                <Grid container spacing={1} direction="column">
                                    {/* Organization logo */}
                                    <Grid item>
                                        <Typography variant="h6">
                                            {t("organization:logoTitle")}
                                        </Typography>
                                        <Typography gutterBottom>
                                            {t("organization:logoBody")}
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <StyledDesktopImagePicker
                                            imageUrl={me?.organization?.logo}
                                            placeholderText={t(
                                                "organization:logo"
                                            )}
                                            uploading={uploadingLogo}
                                            onPickImage={handleUploadLogo}
                                            onDelete={deleteLogoMutation}
                                            classes={{
                                                placeholder:
                                                    classes.placeholder,
                                            }}
                                            aspectRatio={4}
                                            style={{
                                                height: 80,
                                                width: 320,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <StyledMobileImagePicker
                                            imageUrl={
                                                me?.organization?.logoMobile
                                            }
                                            placeholderText={t(
                                                "organization:logoMobile"
                                            )}
                                            uploading={uploadingLogoMobile}
                                            onPickImage={handleUploadLogoMobile}
                                            onDelete={deleteLogoMobileMutation}
                                            classes={{
                                                placeholder:
                                                    classes.placeholderMobile,
                                            }}
                                            aspectRatio={1}
                                            style={{
                                                width: 200,
                                                height: 200,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="h6">
                                            {t("organization:colorsTitle")}
                                        </Typography>
                                        <Typography gutterBottom>
                                            {t("organization:colorsBody")}
                                        </Typography>
                                    </Grid>
                                    {/* App bar color */}
                                    <Grid item>
                                        <ColorPickerFieldController
                                            defaultColor={colors.appBar}
                                            label={t(
                                                "organization:appBarColor"
                                            )}
                                            name="appBarColor"
                                            control={control}
                                        />
                                    </Grid>
                                    {/* Primary color */}
                                    <Grid item>
                                        <ColorPickerFieldController
                                            defaultColor={colors.primary}
                                            label={t(
                                                "organization:primaryColor"
                                            )}
                                            name="primaryColor"
                                            control={control}
                                        />
                                    </Grid>
                                    {/* Secondary color */}
                                    <Grid item>
                                        <ColorPickerFieldController
                                            defaultColor={colors.secondary}
                                            label={t(
                                                "organization:secondaryColor"
                                            )}
                                            name="secondaryColor"
                                            control={control}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </form>
        </OrganizationLayout>
    );
}
