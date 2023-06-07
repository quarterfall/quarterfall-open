import { Grid, Paper } from "@mui/material";
import { useStore } from "context/UIStoreProvider";
import { LanguageMenu } from "features/user/LanguageMenu";
import { UserLayout } from "features/user/layout/UserLayout";
import { useTranslation } from "react-i18next";
import { LabeledSwitch } from "ui/form/inputs/LabeledSwitch";
import { PageHeading } from "ui/PageHeading";

type UserInterfaceSettingsPageProps = {};

export const UserInterfaceSettingsPage = (
    props: UserInterfaceSettingsPageProps
) => {
    const { t } = useTranslation();
    const { darkMode, setDarkMode } = useStore();

    return (
        <UserLayout selected="interface">
            <Grid container direction="column" spacing={1}>
                <Grid item xs={12}>
                    <PageHeading title={t("user:interfaceSettings")} />
                </Grid>
                <Grid item xs={12}>
                    <Paper sx={{ px: 1, py: 2 }}>
                        <Grid container spacing={2} direction="column">
                            {/* User language */}
                            <Grid item xs={12}>
                                <LanguageMenu />
                            </Grid>
                            {/* Dark mode */}
                            <Grid item xs={12}>
                                <LabeledSwitch
                                    label={t("user:darkMode")}
                                    labelPlacement="start"
                                    checked={darkMode}
                                    onChange={(_, checked) =>
                                        setDarkMode(checked)
                                    }
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </UserLayout>
    );
};
