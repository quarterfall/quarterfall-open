import {
    AssessmentMethod,
    BlockType,
    EditorType,
    ProgrammingLanguage,
} from "core";
import { Action } from "./Action.interface";
import { Choice } from "./Choice.interface";
import { Feedback } from "./Feedback.interface";
import { File } from "./File.interface";

export interface Block {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: BlockType;
    index: number;
    title: string;
    text: string;
    videoLink: string;
    programmingLanguage?: ProgrammingLanguage;
    editor?: EditorType;
    choices?: Choice[];
    multipleCorrect?: boolean;
    actions?: Action[];
    answer?: string[];
    files?: File[];
    feedback?: Feedback;
    hasSolution: boolean;
    solution?: string;
    completed?: boolean;
    template?: string;
    metadata?: any;
    assessmentMethod?: AssessmentMethod;
    weight?: number;
    granularity?: number;
    hasRangeLimit?: boolean;
    criteriaText?: string;
    isAssessed?: boolean;
    allowedFileExtensions?: string;
}

export const setLastUsedProgrammingLanguage = (
    language: ProgrammingLanguage
) => {
    if (!window || !window.sessionStorage) {
        return;
    }
    window.sessionStorage.setItem("last_used_programming_language", language);
};

export const getLastUsedProgrammingLanguage = (): ProgrammingLanguage => {
    if (!window || !window.sessionStorage) {
        return ProgrammingLanguage.other;
    }
    return (
        (window.sessionStorage.getItem(
            "last_used_programming_language"
        ) as ProgrammingLanguage) || ProgrammingLanguage.other
    );
};
