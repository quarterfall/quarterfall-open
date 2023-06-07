import { CloudcheckActionType } from "./CloudcheckActionType";
import { DatabaseDialect } from "./DatabaseDialect";
import { IOTest } from "./IOTest";
import { ProgrammingLanguage } from "./ProgrammingLanguage";
import { UnitTest } from "./UnitTest";

export interface PipelineStepOptions {
    language?: ProgrammingLanguage;
    hideFeedback?: boolean;
    answerEmbedding?: string;
    languageData?: any;
    stopOnMatch?: boolean;
    // For run code action
    code?: string;
    inputs?: { input?: string }[];
    // For unit test action
    imports?: string;
    tests?: UnitTest[];
    ioTests?: IOTest[];
    // For run javascript
    sandbox?: any;
    external?: string[];
    expression?: boolean;
    // For git action
    gitUrl?: string;
    gitBranch?: string;
    gitPrivateKey?: string;
    gitPath?: string;
    forceOverrideCache?: boolean;
    // For webhook action
    webhookUrl?: string;
    // For database action
    databaseDialect?: DatabaseDialect;
    databaseFileUrl?: string;
    // For conditional text action
    condition?: string;
    textOnMatch?: string;
    textOnMismatch?: string;
    // For scoring action
    scoreExpression?: string;
}

export interface PipelineStep {
    action: CloudcheckActionType;
    options: PipelineStepOptions;
}

export interface CloudcheckRequestBody {
    data: any;
    pipeline: PipelineStep[];
}

export interface CloudcheckActionResponse {
    data?: any;
    log: string[];
    code: number;
}
