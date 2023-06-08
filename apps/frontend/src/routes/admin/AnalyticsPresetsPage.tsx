import { AnalyticsPresetListEditor } from "features/admin/analytics/AnalyticsPresetListEditor";
import { AdminLayout } from "features/admin/layout/AdminLayout";

type Props = {};

export const AnalyticsPresetsPage = (props: Props) => {
    return (
        <AdminLayout selected="analytics-presets">
            <AnalyticsPresetListEditor />
        </AdminLayout>
    );
};
