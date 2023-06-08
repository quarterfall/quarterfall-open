import { Box, Grid } from "@mui/material";
import { useAuthContext } from "context/AuthProvider";
import { Permission } from "core";
import { OrganizationLayout } from "features/organization/layout/OrganizationLayout";
import { OrganizationLicenseCard } from "features/organization/license/OrganizationLicenseCard";
import { usePermission } from "hooks/usePermission";
import { useTranslation } from "react-i18next";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { PageHeading } from "ui/PageHeading";

export function OrganizationLicensePage() {
    const { me } = useAuthContext();
    const { t } = useTranslation();
    const can = usePermission();

    // verify that the viewer can see this page
    if (!can(Permission.readOrganizationLicense)) {
        return <AccessErrorPage />;
    }

    return (
        <OrganizationLayout selected="license">
            <Grid container direction="column" spacing={1}>
                <Grid item>
                    <PageHeading title={t("organization:licenseCardTitle")} />
                </Grid>
                <Grid item>
                    <OrganizationLicenseCard organization={me.organization} />
                </Grid>
                <Grid item>
                    <Box style={{ height: 65 }} />
                </Grid>
            </Grid>
        </OrganizationLayout>
    );
}
