import { MenuItem, Stack } from "@mui/material";
import { AnalyticsType, Permission } from "core";
import { AuthGuard } from "features/auth/components/AuthGuard";
import { RoleGuard } from "features/auth/components/RoleGuard";
import { OrganizationAnalyticsListEditor } from "features/organization/analytics/OrganizationAnalyticsListEditor";
import { OrganizationLayout } from "features/organization/layout/OrganizationLayout";
import { usePermission } from "hooks/usePermission";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { Align } from "ui/Align";
import { LabeledSelect } from "ui/form/inputs/LabeledSelect";
import { PageHeading } from "ui/PageHeading";

function OrganizationAnalyticsDefaults() {
    const { t } = useTranslation();
    const can = usePermission();
    const [type, setType] = useState<AnalyticsType>(AnalyticsType.course);

    // verify that the view can see this page
    if (!can(Permission.updateOrganization)) {
        return <AccessErrorPage />;
    }

    const allowedAnalyticsTypes = [
        AnalyticsType.course,
        AnalyticsType.assignment,
        AnalyticsType.student,
    ];

    return (
        <RoleGuard showStaffInterface>
            <OrganizationLayout selected="analytics-defaults">
                <Stack spacing={2}>
                    <PageHeading
                        title={t("analytics:organizationDefaultsTitle")}
                        description={t(
                            "analytics:organizationDefaultsDescription"
                        )}
                    />
                    <Align left>
                        <LabeledSelect
                            style={{ minWidth: 200 }}
                            displayEmpty
                            label={t("analytics:selectType")}
                            value={type}
                            onChange={(e) =>
                                setType(e.target.value as AnalyticsType)
                            }
                            variant="outlined"
                        >
                            {allowedAnalyticsTypes.map((key) => {
                                return (
                                    <MenuItem
                                        key={key}
                                        value={AnalyticsType[key]}
                                    >
                                        {t(
                                            `analytics:type_${AnalyticsType[key]}`
                                        )}
                                    </MenuItem>
                                );
                            })}
                        </LabeledSelect>
                    </Align>
                    <OrganizationAnalyticsListEditor type={type} />
                </Stack>
            </OrganizationLayout>
        </RoleGuard>
    );
}

export const getServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, [
            "common",
            "notifications",
            "beacon",
            "analytics",
            "organization",
            "assignment",
        ])),
    },
});

export default () => (
    <AuthGuard>
        <OrganizationAnalyticsDefaults />
    </AuthGuard>
);
