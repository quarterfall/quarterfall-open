import { Alert, AlertTitle } from "@mui/material";
import { SecurityIcon } from "components/icons";
import { useAuthContext } from "context/AuthProvider";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export interface SystemAdminSettingsProps {
    children: ReactNode;
}

export function SystemAdminSettings(props: SystemAdminSettingsProps) {
    const { children } = props;
    const { t } = useTranslation();
    const { me } = useAuthContext();

    return me?.isSysAdmin ? (
        <Alert
            icon={<SecurityIcon fontSize="inherit" />}
            severity="warning"
            variant="outlined"
            sx={{
                width: "100%",
                "& .MuiAlert-message": {
                    width: "100%",
                    marginRight: 4,
                },
            }}
        >
            <AlertTitle>{t("admin:systemAdminSetting")}</AlertTitle>
            {children}
        </Alert>
    ) : null;
}
