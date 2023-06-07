import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Grid } from "@mui/material";
import { DataTable } from "components/dataview/datatable/DataTable";
import {
    DataTableQuery,
    useDataTableQuery,
} from "components/dataview/datatable/DataTableQuery";
import { AnalyticsType } from "core";
import { useToast } from "hooks/useToast";
import { AnalyticsBlock } from "interface/AnalyticsBlock.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "ui/dialog/ConfirmationDialog";
import { FilterCard } from "ui/FilterCard";
import { Loading } from "ui/Loading";
import { useNavigation } from "ui/route/Navigation";
import { AddAnalyticsPresetDialog } from "./AddAnalyticsPresetDialog";
import {
    useAnalyticsBlockPresets,
    useDeleteAnalyticsBlockPresets,
} from "./AnalyticsPresets.data";
import { AnalyticsTypeFilter } from "./AnalyticsTypeFilter";

export interface PresetQuery extends DataTableQuery {
    hasTypeFilter: boolean;
    types: AnalyticsType[];
}

export function AnalyticsPresetListEditor() {
    const { t } = useTranslation();
    const [addBlockDialogOpen, setAddBlockDialogOpen] = useState(false);
    const { data, loading, refetch } = useAnalyticsBlockPresets();
    const [query, updateQuery] = useDataTableQuery<PresetQuery>({
        orderBy: "",
        hasTypeFilter: false,
        types: [],
    });

    const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
    const [removePresetsDialogOpen, setRemovePresetsDialogOpen] =
        useState(false);
    const [deleteAnalyticsPresetsMutation] = useDeleteAnalyticsBlockPresets();
    const { showSuccessToast } = useToast();

    const router = useNavigation();

    const onCloseDialog = () => {
        setAddBlockDialogOpen(false);
        refetch();
    };

    const handleDeletePresets = async () => {
        setRemovePresetsDialogOpen(false);
        setSelectedEntries([]);
        await deleteAnalyticsPresetsMutation({
            variables: { ids: selectedEntries },
        });
        await refetch();
        showSuccessToast(t("analytics:presetsDeletedNotification"));
    };

    if (!data || loading) {
        return <Loading />;
    }

    // Preset type filter updating

    const presetTypes = [
        AnalyticsType.organization,
        AnalyticsType.course,
        AnalyticsType.assignment,
        AnalyticsType.student,
    ];

    const onChangeSelectedTypes = (newSelectedTypes: AnalyticsType[]) => {
        if (newSelectedTypes.length === presetTypes.length) {
            updateQuery({
                types: [],
                hasTypeFilter: false,
                page: 1,
            });
        } else {
            updateQuery({
                types: newSelectedTypes,
                hasTypeFilter: true,
                page: 1,
            });
        }
    };

    const blocks = (data.analyticsBlockPresets || []).filter(
        (b) => !query.hasTypeFilter || query.types.indexOf(b.type) >= 0
    );

    return (
        <>
            <Grid container>
                <Grid item xs={12}>
                    <FilterCard>
                        <AnalyticsTypeFilter
                            onChangeSelectedTypes={onChangeSelectedTypes}
                            types={presetTypes}
                            selectedTypes={
                                query.hasTypeFilter ? query.types : presetTypes
                            }
                        />
                    </FilterCard>
                </Grid>
                <Grid item xs={12}>
                    <DataTable
                        columns={[
                            {
                                headerName: t("title"),
                                field: "title",
                                render: (b) => t(b.title),
                            },
                            {
                                headerName: t("analytics:type"),
                                field: "type",
                                render: (b) => t(`analytics:type_${b.type}`),
                            },
                        ]}
                        rows={blocks || []}
                        total={blocks.length}
                        {...query}
                        updateQuery={updateQuery}
                        onRowClick={(entry: AnalyticsBlock) => {
                            router.push(
                                `/admin/analytics-presets/edit/${entry.id}`
                            );
                        }}
                        hideSearch
                        hideEmptyRows
                        selectedRows={selectedEntries}
                        onChangeSelectedRows={setSelectedEntries}
                        onDeleteRows={() => setRemovePresetsDialogOpen(true)}
                    />
                </Grid>
            </Grid>
            <Box sx={{ width: "100%", marginTop: (theme) => theme.spacing(1) }}>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => setAddBlockDialogOpen(true)}
                    color="primary"
                    startIcon={<AddIcon />}
                >
                    {t("assignment:addBlock")}
                </Button>
            </Box>
            <AddAnalyticsPresetDialog
                open={addBlockDialogOpen}
                onClose={onCloseDialog}
            />
            {/* Remove presets confirmation dialog */}
            <ConfirmationDialog
                open={removePresetsDialogOpen}
                title={t("analytics:confirmDeletePresetsTitle")}
                message={t("analytics:confirmDeletePresetsMessage", {
                    count: selectedEntries.length,
                })}
                onContinue={handleDeletePresets}
                onCancel={() => {
                    setRemovePresetsDialogOpen(false);
                }}
            />
        </>
    );
}
