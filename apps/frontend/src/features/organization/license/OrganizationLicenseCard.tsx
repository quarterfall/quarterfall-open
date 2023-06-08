import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";
import SendIcon from "@mui/icons-material/Send";
import {
    Alert,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Container,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Typography,
} from "@mui/material";
import { SystemAdminSettings } from "components/admin/SystemAdminSettings";
import { config } from "config";
import { Permission } from "core";
import { format, isAfter } from "date-fns";
import { usePermission } from "hooks/usePermission";
import { Organization } from "interface/Organization.interface";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { AccessErrorPage } from "routes/error/AccessErrorPage";
import { Align } from "ui/Align";
import { useDateLocale } from "ui/hooks/DateLocale";
import { OrganizationLicenseAdmin } from "./OrganizationLicenseAdmin";

const Markdown = dynamic(() => import("ui/markdown/Markdown"));

export interface OrganizationLicenseCardProps {
    organization: Organization;
}

export function OrganizationLicenseCard(props: OrganizationLicenseCardProps) {
    const { organization } = props;
    const { t } = useTranslation();
    const can = usePermission();
    const { locale } = useDateLocale();

    const handleClickContactUs = () => {};

    const licenseExpired =
        organization.licenseRenewalDate &&
        isAfter(new Date(), new Date(organization.licenseRenewalDate));
    // verify that the view can see this page
    if (!can(Permission.readOrganizationLicense)) {
        return <AccessErrorPage />;
    }

    return (
        <>
            <Card>
                <CardHeader title={t("organization:licenseInformation")} />
                <CardContent>
                    <Grid container spacing={1} direction="column">
                        {organization.licenseRemark && (
                            <Grid item>
                                <Alert severity="info">
                                    {t(organization.licenseRemark)}
                                </Alert>
                            </Grid>
                        )}
                        {licenseExpired && (
                            <Grid item>
                                <Alert severity="warning">
                                    {t("organization:licenseExpiredMessage")}
                                </Alert>
                            </Grid>
                        )}
                        <Grid item>
                            <Paper variant="outlined">
                                <List>
                                    <ListItem>
                                        <ListItemIcon sx={{ minWidth: "40px" }}>
                                            <GroupIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={t(
                                                "organization:licenseStudents",
                                                {
                                                    count:
                                                        organization.licenseTotalStudentCredits ||
                                                        0,
                                                    used: organization.licenseUsedStudentCredits,
                                                }
                                            )}
                                        />
                                    </ListItem>
                                    {organization.licenseRenewalDate && (
                                        <ListItem>
                                            <ListItemIcon
                                                sx={{ minWidth: "40px" }}
                                            >
                                                <CalendarTodayIcon />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={t(
                                                    "organization:licenseRenewalDate",
                                                    {
                                                        date: format(
                                                            new Date(
                                                                organization.licenseRenewalDate
                                                            ),
                                                            "PPPP",
                                                            { locale }
                                                        ),
                                                    }
                                                )}
                                            />
                                        </ListItem>
                                    )}
                                </List>
                            </Paper>
                        </Grid>

                        {/* License admin settings */}
                        <Grid item>
                            <SystemAdminSettings>
                                <OrganizationLicenseAdmin
                                    organization={organization}
                                />
                            </SystemAdminSettings>
                        </Grid>
                        <Grid item>
                            <Box sx={{ padding: 2 }}>
                                <Markdown linkTarget="_blank" dense>
                                    {t(
                                        "organization:studentCreditsExplanation"
                                    )}
                                </Markdown>
                            </Box>
                        </Grid>
                    </Grid>
                    <CardActions>
                        <Container maxWidth="sm">
                            <Typography
                                align="center"
                                color="textSecondary"
                                sx={{
                                    padding: (theme) => theme.spacing(3, 0, 3),
                                }}
                            >
                                {t("organization:changeCancelLicenseContact")}
                            </Typography>
                            <Align center>
                                <Button
                                    color="primary"
                                    size="large"
                                    variant="outlined"
                                    startIcon={<SendIcon />}
                                    onClick={handleClickContactUs}
                                >
                                    {t("contactUs")}
                                </Button>
                            </Align>
                        </Container>
                    </CardActions>
                </CardContent>
            </Card>
        </>
    );
}
