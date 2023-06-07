import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import InfoIcon from "@mui/icons-material/Info";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import { Button, Card, CardContent, Grid } from "@mui/material";
import { RouteTabs } from "components/layout/RouteTabs";
import { OrganizationLicenseAdmin } from "features/organization/license/OrganizationLicenseAdmin";
import { useTranslation } from "react-i18next";
import { Loading } from "ui/Loading";
import { PageHeading } from "ui/PageHeading";
import { useNavigation } from "ui/route/Navigation";
import { useOrganization } from "../../features/admin/api/Admin.data";
import { AdminLayout } from "../../features/admin/layout/AdminLayout";
import { AdminOrganizationGeneral } from "../../features/admin/organization/AdminOrganizationGeneral";
import { AdminOrganizationUsers } from "../../features/admin/organization/AdminOrganizationUsers";

export interface AdminOrganizationProps {
    id: string;
    tab: "general" | "license" | "users";
}

export function AdminOrganizationPage(props: AdminOrganizationProps) {
    const { id, tab } = props;
    const { data, loading } = useOrganization(id);
    const { t } = useTranslation();
    const router = useNavigation();

    if (!data || loading) {
        return <Loading />;
    }
    const organization = data?.organization;

    const routes = [
        {
            link: "",
            text: "general",
            icon: <InfoIcon key="edit_icon" />,
        },
        {
            link: "license",
            text: "organization:license",
            icon: <SecurityIcon key="solution_icon" />,
        },
        {
            link: "users",
            icon: <PeopleIcon key="users_icon" />,
        },
    ];

    return (
        <AdminLayout selected="general">
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <PageHeading title={organization.name} />
                </Grid>
                <Grid item xs={12}>
                    <Button
                        startIcon={<ChevronLeftIcon />}
                        onClick={() => router.push("/admin")}
                    >
                        {t("back")}
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <RouteTabs routes={routes} />
                </Grid>
                {tab === "general" && (
                    <Grid item xs={12}>
                        <AdminOrganizationGeneral organization={organization} />
                    </Grid>
                )}
                {tab === "license" && (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <OrganizationLicenseAdmin
                                    organization={organization}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                )}
                {tab === "users" && (
                    <Grid item xs={12}>
                        <AdminOrganizationUsers organization={organization} />
                    </Grid>
                )}
            </Grid>
        </AdminLayout>
    );
}
