import { AnalyticsBlock } from "interface/AnalyticsBlock.interface";
import { AnalyticsBlockCard } from "./AnalyticsBlockCard";
import {
    useDeleteCourseAnalyticsBlock,
    useMoveCourseAnalyticsBlockToIndex,
    useUpdateCourseAnalyticsBlock,
} from "./api/Analytics.data";

export interface CourseAnalyticsBlockCardProps {
    block: AnalyticsBlock;
    index?: number;
    disableMoveUp?: boolean;
    disableMoveDown?: boolean;
    computing?: boolean;
    handleCompute?: () => void;
    preview?: boolean;
    result?: string;
    onClickEdit?: () => void;
}

export function CourseAnalyticsBlockCard(props: CourseAnalyticsBlockCardProps) {
    const {
        block,
        index = 0,
        preview,
        computing,
        handleCompute,
        disableMoveUp,
        disableMoveDown,
        result,
        onClickEdit,
    } = props;
    const [updateAnalyticsBlockMutation] = useUpdateCourseAnalyticsBlock();
    const [deleteAnalyticsBlockMutation] = useDeleteCourseAnalyticsBlock();
    const [moveBlockToIndexMutation] = useMoveCourseAnalyticsBlockToIndex();

    const handleDelete = async () => {
        await deleteAnalyticsBlockMutation({
            variables: {
                id: block.id,
            },
        });
    };

    const handleMoveUp = () => {
        moveBlockToIndexMutation({
            variables: {
                index: index - 1,
                id: block.id,
            },
        });
    };

    const handleMoveDown = () => {
        moveBlockToIndexMutation({
            variables: {
                index: index + 1,
                id: block.id,
            },
        });
    };

    const handleClickToggleFullWidth = async () => {
        return updateAnalyticsBlockMutation({
            variables: {
                id: block.id,
                input: {
                    fullWidth: !block.fullWidth,
                },
            },
        });
    };

    return (
        <AnalyticsBlockCard
            block={block}
            disableMoveUp={disableMoveUp}
            disableMoveDown={disableMoveDown}
            preview={preview}
            computing={computing}
            onCompute={handleCompute}
            result={result}
            onClickEdit={onClickEdit}
            onClickToggleFullWidth={handleClickToggleFullWidth}
            onMoveDown={handleMoveDown}
            onMoveUp={handleMoveUp}
            onDelete={handleDelete}
        />
    );
}
