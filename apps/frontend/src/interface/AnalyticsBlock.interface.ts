import { AnalyticsType } from "core";

export interface AnalyticsBlock {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: AnalyticsType;
    title: string;
    presetName: string;
    code: string;
    fullWidth: boolean;
    published: boolean;
    metadata?: any;
    cache?: AnalyticsBlockCache[];
}

export interface AnalyticsBlockCache {
    id: string;
    targetId: string;
    result: string;
}
