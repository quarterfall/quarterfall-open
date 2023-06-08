import { AnalyticsBlockCard } from "features/course/staff/analytics/AnalyticsBlockCard";
import { AnalyticsBlock } from "interface/AnalyticsBlock.interface";
import { useEffect, useState } from "react";
import {
    useComputeAnalyticsBlock,
    useDeleteCourseAnalyticsBlockDefault,
    useMoveCourseAnalyticsBlockDefaultToIndex,
    useUpdateCourseAnalyticsBlockDefault,
} from "../api/OrganizationAnalytics.data";

export interface CourseAnalyticsBlockDefaultCardProps {
    block: AnalyticsBlock;
    index?: number;
    disableMoveUp?: boolean;
    disableMoveDown?: boolean;
    preview?: boolean;
    computing?: boolean;
    result?: string;
    onClickEdit?: () => void;
}

export function CourseAnalyticsBlockDefaultCard(
    props: CourseAnalyticsBlockDefaultCardProps
) {
    const {
        block,
        index = 0,
        preview,
        disableMoveUp,
        disableMoveDown,
        onClickEdit,
    } = props;

    const [analyticsData, setAnalyticsData] = useState("");

    const [updateAnalyticsBlockMutation] =
        useUpdateCourseAnalyticsBlockDefault();
    const [deleteAnalyticsBlockMutation] =
        useDeleteCourseAnalyticsBlockDefault();
    const [moveBlockToIndexMutation] =
        useMoveCourseAnalyticsBlockDefaultToIndex();
    const [computeAnalyticsBlockMutation] = useComputeAnalyticsBlock();

    const [computing, setComputing] = useState(false);

    const handleComputeAnalytics = async () => {
        setComputing(true);
        const result = await computeAnalyticsBlockMutation({
            variables: {
                id: block.id,
            },
        });
        const r = result.data?.computeAnalyticsBlock;
        setAnalyticsData(r?.result || "");
        setComputing(false);
    };

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

    useEffect(() => {
        handleComputeAnalytics();
    }, []);

    return (
        <AnalyticsBlockCard
            block={block}
            disableMoveUp={disableMoveUp}
            disableMoveDown={disableMoveDown}
            preview={preview}
            result={analyticsData}
            onClickEdit={onClickEdit}
            onClickToggleFullWidth={handleClickToggleFullWidth}
            onMoveDown={handleMoveDown}
            onMoveUp={handleMoveUp}
            onDelete={handleDelete}
            computing={computing}
        />
    );
}
