import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Grid,
    ListItem,
    ListItemIcon,
    ListItemText,
    Stack,
} from "@mui/material";
import { format } from "date-fns";
import { OrganizationInfoCard } from "features/organization/info/OrganizationInfoCard";
import { Organization } from "interface/Organization.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDateLocale } from "ui/hooks/DateLocale";
import { DeleteOrganizationDialog } from "./DeleteOrganizationDialog";

export interface AdminOrganizationGeneralProps {
    organization: Organization;
}

export function AdminOrganizationGeneral(props: AdminOrganizationGeneralProps) {
    const { organization } = props;
    const { t } = useTranslation();

    const { locale } = useDateLocale();
    const [deleteOrgOpen, setDeleteOrgOpen] = useState(false);

    return (
        <>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <Card>
                        <CardHeader
                            title={t("organization:aboutCardTitle")}
                            action={
                                organization.archived ? (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<DeleteForeverIcon />}
                                        onClick={() => setDeleteOrgOpen(true)}
                                    >
                                        {t("delete")}
                                    </Button>
                                ) : undefined
                            }
                        />
                        <CardContent>
                            <Stack spacing={1}>
                                <ListItem disableGutters dense>
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <FingerprintIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={organization.id} />
                                </ListItem>
                                <ListItem disableGutters dense>
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <CalendarTodayIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={t("createdAtDate", {
                                            date: format(
                                                new Date(
                                                    organization.createdAt
                                                ),
                                                "PPp",
                                                { locale }
                                            ),
                                        })}
                                    />
                                </ListItem>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <OrganizationInfoCard organization={organization} />
                </Grid>
            </Grid>
            <DeleteOrganizationDialog
                organization={organization}
                open={deleteOrgOpen}
                onClose={() => setDeleteOrgOpen(false)}
            />
        </>
    );
}
