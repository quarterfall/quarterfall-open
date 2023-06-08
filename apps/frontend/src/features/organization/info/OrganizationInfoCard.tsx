import { Card, CardContent, Stack } from "@mui/material";
import { SystemAdminSettings } from "components/admin/SystemAdminSettings";
import { isEmpty, isURL } from "core";
import { useToast } from "hooks/useToast";
import { Organization } from "interface/Organization.interface";
import isEqual from "lodash/isEqual";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAutosaveForm } from "ui/form/Autosave";
import { SwitchController } from "ui/form/SwitchController";
import { TextFieldController } from "ui/form/TextFieldController";
import { useUpdateOrganization } from "../api/OrganizationGeneral.data";

import { OrganizationEmailDomainNamesField } from "./OrganizationEmailDomainNamesField";

export interface OrganizationInfoCardProps {
    organization: Organization;
}
export function OrganizationInfoCard(props: OrganizationInfoCardProps) {
    const { organization } = props;
    const [updateOrganizationMutation] = useUpdateOrganization();
    const { showSuccessToast } = useToast();
    const { t } = useTranslation();

    const onSave = async (input) => {
        await updateOrganizationMutation({
            variables: {
                id: organization.id,
                input,
            },
        });
        showSuccessToast();
    };

    const { control, reset } = useAutosaveForm<Organization>({
        defaultValues: { ...organization },
        onSave,
    });

    // Due to an issue with array data not being passed correctly on change,
    // this is a workaround using watch (needed for the keywords here)
    const { control: emailDomainNamesControl, watch } = useForm({
        mode: "onChange",
        defaultValues: {
            emailDomainNames: [...organization?.emailDomainNames],
        },
    });

    const emailDomainNames = watch("emailDomainNames");

    useEffect(() => {
        if (!isEqual(emailDomainNames, organization.emailDomainNames)) {
            onSave({ emailDomainNames });
        }
    }, [emailDomainNames]);

    useEffect(() => {
        reset(organization);
    }, [organization.id]);

    return (
        <Card>
            <CardContent>
                <Stack spacing={1}>
                    {/* Organization name */}
                    <TextFieldController
                        fullWidth
                        required
                        label={t("organization:name")}
                        name="name"
                        control={control}
                    />

                    {/* Organization website */}
                    <TextFieldController
                        fullWidth
                        label={t("organization:website")}
                        control={control}
                        name="website"
                        controllerProps={{
                            rules: {
                                validate: (v) =>
                                    isEmpty(v) ||
                                    isURL(v) ||
                                    (t("validationErrorInvalidUrl") as string),
                            },
                        }}
                    />
                    <SystemAdminSettings>
                        {/* Organization subdomain */}
                        <Stack spacing={2}>
                            <TextFieldController
                                fullWidth
                                label={t("organization:subdomain")}
                                control={control}
                                name="subdomain"
                            />
                            <TextFieldController
                                fullWidth
                                label={t("organization:ssoProvider")}
                                control={control}
                                name="ssoProvider"
                            />
                            <OrganizationEmailDomainNamesField
                                name="emailDomainNames"
                                control={emailDomainNamesControl as any}
                            />

                            <SwitchController
                                label={t("archived")}
                                control={control}
                                name="archived"
                            />
                            <SwitchController
                                label={t(
                                    "organization:allowAnonymousSubmissions"
                                )}
                                control={control}
                                name="allowAnonymousSubmissions"
                            />
                        </Stack>
                    </SystemAdminSettings>
                </Stack>
            </CardContent>
        </Card>
    );
}
