import { AnalyticsType } from "core";
import { AnalyticsBlock } from "interface/AnalyticsBlock.interface";
import { Course } from "interface/Course.interface";
import dynamic from "next/dynamic";
import { useAddCourseAnalyticsBlock } from "./api/Analytics.data";
import { CourseAnalyticsBlockCard } from "./CourseAnalyticsBlockCard";
const AnalyticsListEditor = dynamic(() => import("./AnalyticsListEditor"));

export interface CourseAnalyticsListEditorProps {
    type: AnalyticsType;
    course: Course;
    targetId?: string;
    handleEditBlock: (blockId: string) => void;
}

export function CourseAnalyticsListEditor(
    props: CourseAnalyticsListEditorProps
) {
    const { type, targetId, course, handleEditBlock } = props;
    const [addCourseAnalyticsBlockMutation] = useAddCourseAnalyticsBlock();

    const blocks = (course?.analyticsBlocks || []).filter(
        (b) => b.type === type
    );

    const handleAddBlock = async (preset?: AnalyticsBlock) => {
        await addCourseAnalyticsBlockMutation({
            variables: { courseId: course?.id, type },
        });
    };

    return (
        <AnalyticsListEditor
            handleAddBlock={handleAddBlock}
            type={type}
            blocks={blocks}
            renderBlock={(block: AnalyticsBlock, index: number) => {
                // If there is no target id (course or organization), select the first element
                const target = targetId
                    ? (block?.cache || []).find((c) => c?.targetId === targetId)
                    : block?.cache[0];
                const result = target?.result;

                return (
                    <CourseAnalyticsBlockCard
                        block={block}
                        index={index}
                        disableMoveUp={index <= 0}
                        disableMoveDown={index >= blocks.length - 1}
                        result={result}
                        onClickEdit={() => handleEditBlock(block.id)}
                    />
                );
            }}
        />
    );
}
