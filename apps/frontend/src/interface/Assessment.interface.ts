import { AssessmentMethod } from "core";

export interface Assessment {
    weight: number;
    granularity: number;
    hasRangeLimit: boolean;
    assessmentMethod: AssessmentMethod;
    criteriaText?: string;
}
