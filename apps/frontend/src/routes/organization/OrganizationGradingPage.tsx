import AddIcon from "@mui/icons-material/Add";
import {
    Button,
    Card,
    CardContent,
    Grid,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { useAuthContext } from "context/AuthProvider";
import {
    useCreateGradingScheme,
    useResetGradingSchemes,
} from "features/organization/api/OrganizationGrading.data";
import { EditOrganizationSchemeDialog } from "features/organization/gradingSchemes/EditOrganizationSchemeDialog";
import { OrganizationGradingSchemeMenu } from "features/organization/gradingSchemes/OrganizationGradingSchemeMenu";
import { OrganizationLayout } from "features/organization/layout/OrganizationLayout";
import { useToast } from "hooks/useToast";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Align } from "ui/Align";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { PageHeading } from "ui/PageHeading";
export default function OrganizationGradingPage() {
    const { t } = useTranslation();
    const { showSuccessToast } = useToast();
    const { me } = useAuthContext();

    const orgGradingSchemes = me?.organization?.gradingSchemes;

    const [resetSchemesDialogOpen, setResetSchemesDialogOpen] = useState(false);

    const [selectedScheme, setSelectedScheme] = useState(null);
    const [editGradingSchemeDialogOpen, setEditGradingSchemeDialogOpen] =
        useState(false);

    const [createGradingSchemeMutation] = useCreateGradingScheme();
    const [resetGradingSchemesMutation] = useResetGradingSchemes();

    const handleAddGradingScheme = async () => {
        await createGradingSchemeMutation();
        showSuccessToast();
    };

    const handleResetGradingSchemes = async () => {
        await resetGradingSchemesMutation();
        setResetSchemesDialogOpen(false);
        showSuccessToast();
    };

    return (
        <OrganizationLayout selected="grading">
            <Grid container direction="column" spacing={1}>
                <Grid item xs={12}>
                    <PageHeading
                        title={t("gradingSchemes")}
                        description={t("organization:gradingSchemeText")}
                    />
                </Grid>
                {!orgGradingSchemes?.length && (
                    <Grid item xs={12}>
                        <Button
                            startIcon={<AddIcon />}
                            color="primary"
                            variant="contained"
                            onClick={() => handleAddGradingScheme()}
                        >
                            {t("organization:createGradingSchemeTitle")}
                        </Button>
                    </Grid>
                )}

                {!!orgGradingSchemes?.length && (
                    <Grid container item spacing={1} direction="row">
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Stack spacing={2}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>
                                                        {t(
                                                            "organization:gradingSchemeName"
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {t(
                                                            "organization:gradingSchemeDescription"
                                                        )}
                                                    </TableCell>
                                                    <TableCell />
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {orgGradingSchemes.map(
                                                    (scheme) => (
                                                        <TableRow
                                                            key={scheme.id}
                                                            hover
                                                            onClick={(
                                                                event
                                                            ) => {
                                                                event.stopPropagation();
                                                                setSelectedScheme(
                                                                    scheme
                                                                );
                                                                setEditGradingSchemeDialogOpen(
                                                                    true
                                                                );
                                                            }}
                                                            sx={{
                                                                "&:hover": {
                                                                    cursor: "pointer",
                                                                },
                                                            }}
                                                        >
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    {`${t(
                                                                        scheme.name
                                                                    )} ${
                                                                        scheme.isDefault
                                                                            ? `(${t(
                                                                                  "default"
                                                                              )})`
                                                                            : ""
                                                                    }`}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                {t(
                                                                    scheme.description
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <OrganizationGradingSchemeMenu
                                                                    gradingScheme={
                                                                        scheme
                                                                    }
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                        <Align left>
                                            <Button
                                                startIcon={<AddIcon />}
                                                onClick={() =>
                                                    handleAddGradingScheme()
                                                }
                                            >
                                                {t(
                                                    "organization:createGradingSchemeTitle"
                                                )}
                                            </Button>
                                        </Align>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12}>
                            <Align right>
                                <Button
                                    onClick={() =>
                                        setResetSchemesDialogOpen(true)
                                    }
                                    color="error"
                                    variant="outlined"
                                >
                                    {t("organization:resetAllSchemesToDefault")}
                                </Button>
                            </Align>
                        </Grid>
                    </Grid>
                )}
            </Grid>

            <EditOrganizationSchemeDialog
                open={editGradingSchemeDialogOpen}
                onClose={() => {
                    setEditGradingSchemeDialogOpen(false);
                }}
                gradingSchemeId={selectedScheme ? selectedScheme?.id : ""}
            />
            <ConfirmationDialog
                open={resetSchemesDialogOpen}
                title={t("organization:confirmResetGradingSchemesTitle")}
                message={t("organization:confirmResetGradingSchemesMessage")}
                onContinue={handleResetGradingSchemes}
                onCancel={() => {
                    setResetSchemesDialogOpen(false);
                }}
            />
        </OrganizationLayout>
    );
}
