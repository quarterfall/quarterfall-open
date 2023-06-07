import { ActionType, DatabaseDialect } from "core";
import { IOTest } from "./IOTest.interface";
import { UnitTest } from "./UnitTest.interface";

export interface Action {
    id: string;
    type: ActionType;
    condition?: string;
    stopOnMatch?: boolean;
    code?: string;
    text?: string;
    textOnMismatch?: string;
    scoreExpression?: string;
    gitUrl?: string;
    gitBranch?: string;
    gitPrivateKey?: string;
    databaseFileLabel?: string;
    databaseDialect?: DatabaseDialect;
    path?: string;
    url?: string;
    tests?: UnitTest[];
    ioTests?: IOTest[];
    hideFeedback?: boolean;
    answerEmbedding?: string;
    imports?: string;
    teacherOnly?: boolean;
    forceOverrideCache?: boolean;
}
