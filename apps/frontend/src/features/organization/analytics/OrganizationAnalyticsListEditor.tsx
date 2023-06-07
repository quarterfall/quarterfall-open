import { useAuthContext } from "context/AuthProvider";
import { AnalyticsType } from "core";
import { AnalyticsBlock } from "interface/AnalyticsBlock.interface";
import dynamic from "next/dynamic";
import { useNavigation } from "ui/route/Navigation";
import { useAddCourseAnalyticsBlockDefault } from "../api/OrganizationAnalytics.data";
import { CourseAnalyticsBlockDefaultCard } from "./CourseAnalyticsBlockDefaultCard";
const AnalyticsListEditor = dynamic(
    () => import("features/course/staff/analytics/AnalyticsListEditor")
);

export interface OrganizationAnalyticsListEditorProps {
    type: AnalyticsType;
}

export function OrganizationAnalyticsListEditor(
    props: OrganizationAnalyticsListEditorProps
) {
    const { type } = props;
    const [addDefaultBlockMutation] = useAddCourseAnalyticsBlockDefault();

    const router = useNavigation();
    const { me } = useAuthContext();

    const blocks = (me.organization?.courseAnalyticsBlockDefaults || []).filter(
        (b) => b.type === type
    );

    const handleAddBlock = async (preset?: AnalyticsBlock) => {
        await addDefaultBlockMutation({
            variables: { type },
        });
    };

    const handleEditBlock = (blockId: string) => {
        const baseString = `/organization/analytics/defaults/${blockId}`;
        router.push(baseString);
    };

    return (
        <AnalyticsListEditor
            handleAddBlock={handleAddBlock}
            type={type}
            blocks={blocks}
            renderBlock={(block: AnalyticsBlock, index: number) => {
                return (
                    <CourseAnalyticsBlockDefaultCard
                        block={block}
                        index={index}
                        disableMoveUp={index <= 0}
                        disableMoveDown={index >= blocks.length - 1}
                        onClickEdit={() => handleEditBlock(block.id)}
                    />
                );
            }}
        />
    );
}
