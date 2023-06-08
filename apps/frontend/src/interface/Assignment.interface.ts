import { AssessmentType, BlockType, PublicLicenseType } from "core";
import { Block } from "./Block.interface";
import { File } from "./File.interface";
import { GradingScheme } from "./GradingScheme.interface";
import { Module } from "./Module.interface";
import { Submission } from "./Submission.interface";

export interface Assignment {
    id: string;
    publicKey?: string;
    shareCode?: string;
    createdAt: Date;
    updatedAt: Date;
    moduleId: string;
    title: string;
    hasIntroduction?: boolean;
    introduction: string;
    visible: boolean;
    isOptional: boolean;
    isStudyMaterial: boolean;
    difficulty?: number;
    forceBlockOrder?: boolean;
    keywords: string[];
    blocks: Block[];
    index: number;
    module: Module;
    completed: boolean;
    hasSubmissions: boolean;
    submission: Submission;
    submissions: Submission[];
    avgUsefulness: number;
    avgDifficulty: number;
    author?: string;
    remarks?: string;
    license: PublicLicenseType;
    files: File[];
    metadata?: any;
    hasGrading?: boolean;
    assessmentType?: AssessmentType;
    gradingSchemeName?: string;
    gradingSchemeDescription?: string;
    gradingSchemeCode?: string;
    gradingSchemes?: GradingScheme[];
    submissionCount?: number;
    unapprovedSubmissionCount?: number;
}

export const assignmentHasQuestions = (assignment: Assignment) => {
    // question types
    const blockTypes = [
        BlockType.CodeQuestion,
        BlockType.MultipleChoiceQuestion,
        BlockType.OpenQuestion,
    ];

    const blocks = assignment.blocks || [];
    for (const block of blocks) {
        if (blockTypes.indexOf(block.type) >= 0) {
            return true;
        }
    }
    return false;
};
