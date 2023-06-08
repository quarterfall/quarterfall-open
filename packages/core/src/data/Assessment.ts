import { AssessmentMethod } from "./AssessmentMethod";

export interface Assessment {
    type: AssessmentMethod;
    weight: number;
    granularity: number;
    hasRangeLimit: boolean;
    criteriaText?: string;
}
