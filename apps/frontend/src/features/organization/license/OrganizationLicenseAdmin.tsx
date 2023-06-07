import { Box, Grid } from "@mui/material";
import { useToast } from "hooks/useToast";
import { Organization } from "interface/Organization.interface";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";
import { DateTimeController } from "ui/form/DateTimeController";
import { NumberFieldController } from "ui/form/NumberFieldController";
import { SwitchController } from "ui/form/SwitchController";
import { TextFieldController } from "ui/form/TextFieldController";
import { useUpdateOrganization } from "../api/OrganizationGeneral.data";

export interface OrganizationLicenseAdminProps {
    organization: Organization;
}
export function OrganizationLicenseAdmin(props: OrganizationLicenseAdminProps) {
    const { organization } = props;
    const { t } = useTranslation();
    const [updateOrganizationMutation] = useUpdateOrganization();
    const { showSuccessToast } = useToast();

    // Form for the organization editor
    const { control } = useAutosaveForm<Organization>({
        defaultValues: organization,
        onSave: async (input: Partial<Organization>) => {
            await updateOrganizationMutation({
                variables: {
                    id: organization.id,
                    input,
                },
            });
            showSuccessToast();
        },
    });

    return (
        <form>
            <Grid container spacing={2}>
                {/* License renewal date */}
                <Grid item xs={12} sm={6}>
                    <Box minWidth={300}>
                        <DateTimeController
                            label={t("organization:licenseRenewalDateField")}
                            name="licenseRenewalDate"
                            control={control}
                        />
                    </Box>
                </Grid>
                {/* Enforce renewal date (service is blocked if license is expired) */}
                <Grid item xs={12}>
                    <SwitchController
                        label={t("organization:licenseEnforceRenewalDateField")}
                        labelPlacement="end"
                        name="licenseEnforceRenewalDate"
                        control={control}
                    />
                </Grid>

                {/* Total student credits */}
                <Grid item xs={12}>
                    <NumberFieldController
                        fullWidth
                        label={t(
                            "organization:licenseTotalStudentCreditsField"
                        )}
                        name="licenseTotalStudentCredits"
                        variant="outlined"
                        control={control}
                    />
                </Grid>

                {/* Used student credits */}
                <Grid item xs={12}>
                    <NumberFieldController
                        fullWidth
                        label={t("organization:licenseUsedStudentCreditsField")}
                        name="licenseUsedStudentCredits"
                        variant="outlined"
                        control={control}
                    />
                </Grid>

                {/* License remark */}
                <Grid item xs={12}>
                    <TextFieldController
                        fullWidth
                        label={t("organization:licenseRemarkField")}
                        name="licenseRemark"
                        variant="outlined"
                        control={control}
                    />
                </Grid>
            </Grid>
        </form>
    );
}
